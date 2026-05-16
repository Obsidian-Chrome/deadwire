# -*- coding: utf-8 -*-
"""
Génère le HTML compact pour toutes les compétences
"""

skills = [
    # Column 1
    ["animaux", "Animaux"],
    ["art", "Art"],
    ["artisanat", "Artisanat"],
    ["athletisme", "Athlétisme"],
    ["conscience", "Conscience"],
    ["culture", "Culture"],
    ["distance", "Distance"],
    ["discretion", "Discrétion"],
    # Column 2
    ["empathie", "Empathie"],
    ["enquete", "Enquête"],
    ["etherologie", "Étherologie"],
    ["larcin", "Larcin"],
    ["medecine", "Médecine"],
    ["melee", "Mêlée"],
    ["persuasion", "Persuasion"],
    # Column 3
    ["pilotage", "Pilotage"],
    ["presence", "Présence"],
    ["resistance", "Résistance"],
    ["technologie", "Technologie"],
    ["netrun", "Netrun"],
    ["survie", "Survie"],
    ["vigilance", "Vigilance"],
]

def generate_skill(skill_id, skill_name):
    return f'''                                <div class="skill">
                                  <label class="skill__mastery">
                                    <input type="checkbox" data-skill-mastery="{skill_id}" />
                                    <span>{skill_name}</span>
                                  </label>
                                  <span class="skill__result" data-skill-result="{skill_id}">0</span>
                                  <span class="skill__eq">=</span>
                                  <input type="number" class="skill__input" data-skill="{skill_id}" value="0" min="0" max="5" />
                                  <span class="skill__plus">+</span>
                                  <input type="number" class="skill__bonus" data-skill-bonus="{skill_id}" value="0" min="-10" max="10" />
                                </div>
'''

# Colonnes
col1 = skills[0:8]
col2 = skills[8:15]
col3 = skills[15:22]

print("<!-- Column 1 -->")
print("                              <div class=\"skillsColumn\">")
for skill_id, skill_name in col1:
    print(generate_skill(skill_id, skill_name), end='')
print("                              </div>")

print("\n<!-- Column 2 -->")
print("                              <div class=\"skillsColumn\">")
for skill_id, skill_name in col2:
    print(generate_skill(skill_id, skill_name), end='')
print("                              </div>")

print("\n<!-- Column 3 -->")
print("                              <div class=\"skillsColumn\">")
for skill_id, skill_name in col3:
    print(generate_skill(skill_id, skill_name), end='')
print("                              </div>")
