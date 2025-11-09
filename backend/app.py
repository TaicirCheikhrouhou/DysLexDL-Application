import os
import io
import base64
import numpy as np
import nibabel as nib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model # type: ignore
from scipy.ndimage import zoom
import cv2
from preprocessing import preprocess_mri_file, preprocess_fmri_file
from flask import send_file, make_response
from report_generator import generate_report

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'.nii', '.nii.gz'}

# Flask app setup
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)

# Load models
MRI_MODEL_PATH = './models/3D_CNN.keras'
FMRI_MODEL_PATH = './models/3DCNNLSTM.keras'
mri_model = load_model(MRI_MODEL_PATH)
fmri_model = load_model(FMRI_MODEL_PATH)

# Dummy credentials
DOCTORS = {
    "doctor1": "secret123",
    "doctor2": "mypassword"
}

# Utility functions
def allowed_file(filename):
    return any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS)

def generate_slice_image(nifti_img):
    data = nifti_img.get_fdata()
    if data.ndim == 4:
        data = data[..., 0]
    z = data.shape[2] // 2
    slice_img = data[:, :, z]
    slice_img = (slice_img - np.min(slice_img)) / (np.max(slice_img) - np.min(slice_img) + 1e-6)
    fig, ax = plt.subplots()
    ax.imshow(slice_img.T, cmap='gray', origin='lower')
    ax.axis('off')
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')

def preprocess_fmri_sequence(file_path, sequence_length=120, target_shape=(64, 64)):
    data = nib.load(file_path).get_fdata()
    z = data.shape[2] // 2
    sequence = data[:, :, z, :sequence_length]
    sequence_resized = np.zeros((target_shape[0], target_shape[1], sequence_length))
    for t in range(sequence_length):
        slice_t = sequence[:, :, t]
        zoom_factors = (target_shape[0] / slice_t.shape[0], target_shape[1] / slice_t.shape[1])
        sequence_resized[:, :, t] = zoom(slice_t, zoom_factors)
    sequence_resized = (sequence_resized - np.min(sequence_resized)) / (np.max(sequence_resized) - np.min(sequence_resized) + 1e-6)
    sequence_resized = np.transpose(sequence_resized, (2, 0, 1))[:, :, :, np.newaxis]
    return sequence_resized

def preprocess_mri_slices(file_path, num_slices=10, img_size=128):
    # Load NIfTI image
    img_nifti = nib.load(file_path)
    img_data = img_nifti.get_fdata()
    # Normalize to [0, 1]
    img_data = (img_data - np.min(img_data)) / (np.max(img_data) - np.min(img_data))
    # Slice selection
    slice_indices = np.linspace(0, img_data.shape[2] - 1, num_slices, dtype=int)
    slices = []
    for i in slice_indices:
        slice_img = img_data[:, :, i]
        slice_img = cv2.resize(slice_img.astype(np.float32), (img_size, img_size))
        slices.append(slice_img)
    # Stack and reshape to (1, 10, 128, 128, 1)
    slices = np.stack(slices, axis=0)
    slices = np.expand_dims(slices, axis=-1)
    sample_input = np.expand_dims(slices, axis=0)
    return sample_input

# Routes
@app.route('/')
def home():
    return '🚀 Backend Flask is running!'

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Les champs 'username' et 'password' sont requis."}), 400

    if DOCTORS.get(username) == password:
        return jsonify({"message": "Connexion réussie.", "username": username}), 200
    else:
        return jsonify({"error": "Identifiants invalides."}), 401

@app.route('/preprocess_fmri', methods=['POST'])
def preprocess_fmri():
    try:
        func_file = request.files['file']
        anat_file = request.files.get('anat_file')  # Optional if not preprocessing
        
        if not func_file:
            return jsonify({"error": "No functional file provided"}), 400

        func_filename = secure_filename(func_file.filename)
        func_path = os.path.join("uploads", func_filename)
        func_file.save(func_path)

        anat_path = None
        if anat_file:
            anat_filename = secure_filename(anat_file.filename)
            anat_path = os.path.join("uploads", anat_filename)
            anat_file.save(anat_path)

        # Call your preprocessing function with both paths
        preprocessed_path = preprocess_fmri_file(func_path, anat_path)

        return jsonify({
            "message": "fMRI preprocessing done",
            "path": preprocessed_path,
            "filename": os.path.basename(preprocessed_path)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/analyze_fmri', methods=['POST'])
def analyze_fmri():
    try:
        # If frontend sent a preprocessed filename
        if 'filename' in request.form:
            filename = request.form['filename']
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        else:
            file = request.files.get('file')
            if not file or not allowed_file(file.filename):
                return jsonify({"error": "Fichier invalide. Seuls les fichiers .nii ou .nii.gz sont autorisés."}), 400

            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

        img = nib.load(filepath)
        preprocessed = preprocess_fmri_sequence(filepath)
        preprocessed = np.expand_dims(preprocessed, axis=0)

        #predict
        prediction = fmri_model.predict(preprocessed)[0][0]
        predicted_class = int(prediction > 0.5)

        return jsonify({
            "message": "Fichier analysé avec succès ✅",
            "prediction": predicted_class,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/preprocess_mri', methods=['POST'])
def preprocess_mri():
    try:
        file = request.files['file']
        if not file:
            return jsonify({"error": "No file provided"}), 400
         # Save the uploaded file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join("uploads", filename)  # Make sure 'uploads/' exists
        file.save(temp_path)
        
        preprocessed_path = preprocess_mri_file(temp_path)
        return jsonify({"message": "MRI preprocessing done", "path": preprocessed_path,
                        "filename": os.path.basename(preprocessed_path)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/analyze_mri', methods=['POST'])
def analyze_mri():
    try:
        # If the request sends a filename instead of a new file
        if 'filename' in request.form:
            filename = request.form['filename']
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        else:
            file = request.files.get('file')
            if not file or not allowed_file(file.filename):
                return jsonify({"error": "Fichier invalide. Seuls les fichiers .nii ou .nii.gz sont autorisés."}), 400

            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

        preprocessed = preprocess_mri_slices(filepath)
        prediction = mri_model.predict(preprocessed)[0]  # Assuming batch size = 1

        predicted_class = np.argmax(prediction)
        confidence = np.max(prediction)

        class_names = ["Typique (TD)", "Dyslexique (DL)"]
        result = class_names[predicted_class]
        os.remove(filepath)
        return jsonify({"result": result})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate_report', methods=['POST'])
def generate_report_route():
    try:
        data = request.json
        result = data['result']
        doctor_name = data['doctor_name']
        notes = data['notes']
        model_name = data.get('model_name', 'Modèle inconnu')

        os.makedirs('./reports', exist_ok=True)
        filepath = generate_report(result, doctor_name, notes, model_name)

        return send_file(filepath, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run server
if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
