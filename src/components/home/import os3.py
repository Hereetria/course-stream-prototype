import os
import re

# Schemas klasörünün tam yolu
SCHEMAS_ROOT = r"C:/Users/Okan/Desktop/XenoTerra_API/XenoTerra.WebAPI/GraphQL/Schemas"

# Tanınan C# yapıları
CLASS_PATTERN = re.compile(r'\b(class|record|interface|struct)\s+(\w+)')

# Bu son eklerden önce suffix eklenecek
KNOWN_SUFFIXES = [
    "Input", "InputType",
    "Payload", "PayloadType",
    "Validator", "Mutation",
    "Query", "Subscription",
    "Event", "FilterType",
    "SortType", "Connection", "ConnectionType",
    "Edge", "EdgeType"
]

def get_suffix_from_path(path):
    if os.sep + "Admin" + os.sep in path or path.endswith(os.sep + "Admin"):
        return "Admin"
    elif os.sep + "User" + os.sep in path or path.endswith(os.sep + "User"):
        return "Self"
    return None


def rename_component(name, suffix):
    for keyword in KNOWN_SUFFIXES:
        if name.endswith(keyword):
            base = name[:-len(keyword)]
            return f"{base}{suffix}{keyword}"
    return name  # fallback (değiştirilmezse)

def process_schema_entities(schemas_root):
    renamed = []

    for entity_dir in os.listdir(schemas_root):
        entity_path = os.path.join(schemas_root, entity_dir)
        if not os.path.isdir(entity_path):
            continue

        for role in ["Admin", "User"]:
            role_path = os.path.join(entity_path, role)
            if not os.path.isdir(role_path):
                continue

            suffix = get_suffix_from_path(role_path)
            if not suffix:
                continue

            for subdir, _, files in os.walk(role_path):
                for file in files:
                    if not file.endswith(".cs"):
                        continue

                    full_path = os.path.join(subdir, file)

                    with open(full_path, "r", encoding="utf-8") as f:
                        content = f.read()

                    modified = False
                    matches = CLASS_PATTERN.findall(content)

                    for kind, class_name in matches:
                        new_class_name = rename_component(class_name, suffix)
                        if new_class_name != class_name:
                            content = re.sub(rf'\b{kind}\s+{class_name}\b',
                                             f'{kind} {new_class_name}', content)
                            modified = True

                    if modified:
                        with open(full_path, "w", encoding="utf-8") as f:
                            f.write(content)

                        filename_wo_ext = os.path.splitext(file)[0]
                        new_filename = rename_component(filename_wo_ext, suffix) + ".cs"
                        new_full_path = os.path.join(subdir, new_filename)

                        if file != new_filename:
                            os.rename(full_path, new_full_path)
                            renamed.append((file, new_filename))

    return renamed


# Kodu çalıştır
renamed = process_schema_entities(SCHEMAS_ROOT)
for old_name, new_name in renamed:
    print(f"Renamed: {old_name} → {new_name}")
