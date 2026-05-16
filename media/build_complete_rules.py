import re

# Lire le contenu extrait
with open(r'c:\Users\djago\Documents\Deadwire\media\extracted_content.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Parser les sections
sections = {}
current_section = None
current_subsection = None
content_buffer = []

# Titres de sections principales
main_sections = [
    'Introduction', 'Système D10', 'Jouer son tour', 'Distances', 
    'Blessures', 'Création de fiche', 'Barème Niveau', 'Barème dépense XP',
    'Talents', 'Domaines', 'Équipement', 'Transcendance'
]

classes = [
    'Astromancien', 'Barde', 'Chevalier Dragon', 'Chevalier Noir', 'Danseur',
    'Érudit', 'Faucheur', 'Guerrier', 'Invocateur', 'Machiniste',
    'Mage Blanc', 'Mage Bleu', 'Mage Noir', 'Mage Rouge', 'Moine',
    'Ninja', 'Paladin', 'Pictomancien', 'Pistosabreur', 'Rôdeur Vipère', 'Samouraï'
]

talents_attrs = ['Force', 'Dextérité', 'Vigueur', 'Charisme', 'Manipulation', 
                 'Apparence', 'Perception', 'Intelligence', 'Astuce']

print(f"Total lines: {len(lines)}")
print("Building sections dictionary...")

# Créer une structure simple
output = {
    'sections': {},
    'classes': {},
    'talents': {}
}

i = 0
while i < len(lines):
    line = lines[i].strip()
    
    # Détecter les sections principales
    if line in main_sections:
        current_section = line
        output['sections'][current_section] = []
        i += 1
        continue
    
    # Détecter les classes
    if line in classes:
        output['classes'][line] = []
        i += 1
        continue
    
    # Détecter les talents par attribut
    if line in talents_attrs and i > 200:  # Éviter conflit avec section création
        output['talents'][line] = []
        i += 1
        continue
    
    # Ajouter le contenu
    if current_section and current_section in output['sections']:
        output['sections'][current_section].append(line)
    
    i += 1

print(f"Sections found: {list(output['sections'].keys())}")
print(f"Classes found: {list(output['classes'].keys())}")
print(f"Talents found: {list(output['talents'].keys())}")

# Sauvegarder pour inspection
with open(r'c:\Users\djago\Documents\Deadwire\media\parsed_structure.txt', 'w', encoding='utf-8') as f:
    for section, content in output['sections'].items():
        f.write(f"\n=== {section} ===\n")
        f.write('\n'.join(content[:50]))  # Limiter pour lisibilité
        f.write('\n')

print("Structure saved to parsed_structure.txt")
