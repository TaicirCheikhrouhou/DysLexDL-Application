import os
import numpy as np
import nibabel as nib
import SimpleITK as sitk
from nilearn.image import resample_to_img, smooth_img
from nilearn.datasets import load_mni152_template


def preprocess_mri_file(mri_path, output_path=None, smooth_fwhm=6):
    """
    Preprocess a single MRI file: bias correction, skull stripping, normalization, smoothing.

    """
    try:
        # Step 1: Load MRI image
        img = nib.load(mri_path)
        print(f"Loaded MRI file: {mri_path}")
        # do your preprocessing steps 
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

    #do your preprocessing steps 

    # Save output
    output_filename = f"preprocessed_{os.path.basename(fmri_file)}"
    output_path = os.path.join("uploads", output_filename)
    smooth_img_final.to_filename(output_path)

    return output_path
