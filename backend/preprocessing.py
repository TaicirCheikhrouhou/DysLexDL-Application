import os
import numpy as np
import nibabel as nib
import SimpleITK as sitk
from nilearn.image import resample_to_img, smooth_img
from nilearn.datasets import load_mni152_template


def preprocess_mri_file(mri_path, output_path=None, smooth_fwhm=6):
    """
    Preprocess a single MRI file: bias correction, skull stripping, normalization, smoothing.

    Parameters:
    - mri_path (str): Path to the input MRI .nii or .nii.gz file
    - output_path (str, optional): Path to save the preprocessed file (default: same dir with _preprocessed suffix)
    - smooth_fwhm (int): Full Width at Half Maximum for Gaussian smoothing

    Returns:
    - str: path to the preprocessed file
    """
    try:
        # Step 1: Load MRI image
        img = nib.load(mri_path)
        print(f"Loaded MRI file: {mri_path}")

        # Step 2: Bias Field Correction using SimpleITK N4
        print("Running bias field correction...")
        img_sitk = sitk.ReadImage(mri_path)
        corrector = sitk.N4BiasFieldCorrectionImageFilter()
        corrected_img = corrector.Execute(img_sitk)
        corrected_data = sitk.GetArrayFromImage(corrected_img)
        corrected_img = nib.Nifti1Image(corrected_data, img.affine)

        # Step 3: Skull Stripping using Otsu threshold
        print("Running skull stripping...")
        mask = sitk.OtsuThreshold(img_sitk, 0, 1, 200)
        mask = sitk.Cast(mask, sitk.sitkFloat32)
        stripped_data = sitk.GetArrayFromImage(mask) * corrected_img.get_fdata()
        stripped_img = nib.Nifti1Image(stripped_data, img.affine)

        # Step 4: Spatial Normalization to MNI space
        print("Normalizing to MNI space...")
        template = load_mni152_template()
        normalized_img = resample_to_img(stripped_img, template, interpolation='nearest')

        # Step 5: Intensity Normalization (Z-score)
        print("Normalizing intensity...")
        data = normalized_img.get_fdata()
        data = (data - np.mean(data)) / np.std(data)
        normalized_img = nib.Nifti1Image(data, normalized_img.affine)

        # Step 6: Spatial Smoothing
        print(f"Smoothing image with FWHM={smooth_fwhm}mm...")
        smoothed_img = smooth_img(normalized_img, fwhm=smooth_fwhm)

        # Step 7: Save output
        if output_path is None:
            base, ext = os.path.splitext(mri_path)
            if ext == '.gz':
                base, _ = os.path.splitext(base)
            output_path = f"{base}_preprocessed.nii.gz"

        smoothed_img.to_filename(output_path)
        print(f"[✓] Saved preprocessed MRI to: {output_path}")

        return output_path

    except Exception as e:
        print(f"[!] MRI preprocessing failed: {e}")
        return None
def preprocess_fmri_file(fmri_file, anat_file=None):
    import nibabel as nib
    from nilearn import image
    from nilearn.datasets import load_mni152_template
    import os

    TR = 2.0
    smooth_fwhm = 6
    mni_template = load_mni152_template()

    # Load images
    func_img = nib.load(fmri_file)
    anat_img = nib.load(anat_file)

    # Step 1: Slice Timing Correction
    stc_img = image.clean_img(func_img, t_r=TR, detrend=False, standardize=False)

    # Step 2: Motion Correction
    mean_img = image.mean_img(stc_img, copy_header=True)
    realigned_img = image.resample_to_img(stc_img, mean_img, interpolation='linear', force_resample=True)

     # Step 3: Co-registration (func to anat)
    coreg_img = image.resample_to_img(realigned_img, anat_img, interpolation='linear', force_resample=True)

    # Step 4: Normalization (anat to MNI)
    norm_img = image.resample_to_img(coreg_img, mni_template, interpolation='linear', force_resample=True)

    # Step 5: Smoothing
    smooth_img_final = image.smooth_img(norm_img, fwhm=smooth_fwhm)

    # Save output
    output_filename = f"preprocessed_{os.path.basename(fmri_file)}"
    output_path = os.path.join("uploads", output_filename)
    smooth_img_final.to_filename(output_path)

    return output_path
