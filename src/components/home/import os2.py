import os
import re

# Gerçek klasör yolu
ROOT_DIR = r"C:\Users\Okan\Desktop\XenoTerra_API\XenoTerra.WebAPI\GraphQL\Schemas"

# Tanınan son ekler
KNOWN_SUFFIXES = [
    "Input", "InputType",
    "Payload", "PayloadType",
    "Validator", "Mutation",
    "Query", "Subscription",
    "Event", "FilterType",
    "SortType", "Connection", "ConnectionType",
    "Edge", "EdgeType"
]

# Admin/User klasörü mü, klasör yolundan anla
def get_role_suffix(path):
    normalized_path = path.replace("\\", "/")
    if "/Admin/" in normalized_path or normalized_path.endswith("/Admin"):
        return "Admin"
    elif "/User/" in normalized_path or normalized_path.endswith("/User"):
        return "Self"
    return None

# İçerideki referansları güncelle
def replace_inner_references(content, suffix):
    for keyword in KNOWN_SUFFIXES:
        pattern = rf'\b(\w+?)(?<!{suffix}){keyword}\b'  # sadece henüz eklenmemiş suffix'leri değiştir
        replacement = rf'\1{suffix}{keyword}'
        content = re.sub(pattern, replacement, content)
    return content

# Dosyaları gez ve güncelle
def update_all_cs_references(root_dir):
    updated_files = []

    for subdir, _, files in os.walk(root_dir):
        suffix = get_role_suffix(subdir)
        if not suffix:
            continue

        for file in files:
            if not file.endswith(".cs"):
                continue

            full_path = os.path.join(subdir, file)
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = replace_inner_references(content, suffix)

            if new_content != content:
                with open(full_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                updated_files.append(full_path)

    return updated_files

# Çalıştır
if __name__ == "__main__":
    changed = update_all_cs_references(ROOT_DIR)
    print("✅ Güncellenen dosyalar:")
    for file in changed:
        print("→", file)
