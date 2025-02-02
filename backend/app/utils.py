import os

def save_file(file, destination: str):
    """ Save file to a specified destination """
    with open(destination, "wb") as f:
        f.write(file)
        
def remove_temp_file(file_path: str):
    """ Remove temporary file after processing """
    try:
        os.remove(file_path)
    except Exception as e:
        print(f"Error removing temp file: {str(e)}")
