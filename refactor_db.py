import os

def replace_in_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        new_content = content.replace('~/shared/db/schema', '@itcom/db/schema')
        new_content = new_content.replace('~/shared/db/client.server', '@itcom/db/client')
        
        if content != new_content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                replace_in_file(os.path.join(root, file))

process_dir('web/app')
process_dir('admin/app')
