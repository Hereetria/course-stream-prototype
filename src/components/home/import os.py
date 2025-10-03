import os
import re

ROOT_DIR = r"C:\Users\Okan\Desktop\XenoTerra_API\XenoTerra.WebAPI\GraphQL\Schemas"

def remove_role_suffixes_from_references(content):
    return re.sub(r'\b(Abstract\w*)(Admin|Self)(Validator)\b', r'\1\3', content)

def clean_suffixes_from_files(root_dir):
    cleaned_files = []

    for subdir, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".cs"):
                full_path = os.path.join(subdir, file)
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()

                new_content = remove_role_suffixes_from_references(content)

                if new_content != content:
                    with open(full_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    cleaned_files.append(full_path)

    return cleaned_files

# çalıştır
cleaned = clean_suffixes_from_files(ROOT_DIR)
for path in cleaned:
    print("Güncellendi:", path)
