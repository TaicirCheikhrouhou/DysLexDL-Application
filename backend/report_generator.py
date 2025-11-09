# report_generator.py
from fpdf import FPDF
from datetime import datetime

def generate_report(result, doctor_name, notes, model_name="Modèle inconnu"):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    pdf.cell(200, 10, txt="Analysis Report - Dyslexia", ln=True, align='C')
    pdf.ln(10)
    pdf.cell(200, 10, txt=f"Date and Time: {now}", ln=True)
    pdf.cell(200, 10, txt=f"Model used : {model_name}", ln=True)
    pdf.cell(200, 10, txt=f"Name of Doctor : {doctor_name}", ln=True)
    pdf.ln(5)
    pdf.cell(200, 10, txt=f"Prediction Result : {result}", ln=True)
    pdf.ln(5)
    pdf.multi_cell(0, 10, txt=f"Reviewer's Notes :\n{notes}")
    
    filename = f"report_{now.replace(':', '-').replace(' ', '_')}.pdf"
    filepath = f"./reports/{filename}"

    pdf.output(filepath)
    return filepath
