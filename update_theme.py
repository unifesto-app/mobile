#!/usr/bin/env python3
import re
import os

files_to_update = [
    'src/screens/EventsScreen.tsx',
    'src/screens/EventDetailScreen.tsx',
    'src/screens/SignUpScreen.tsx',
    'src/screens/NewLoginScreen.tsx',
    'src/screens/EventRegistrationScreen.tsx',
    'src/screens/RegistrationSuccessScreen.tsx',
    'src/screens/TicketsScreen.tsx',
    'src/screens/TicketDetailScreen.tsx',
    'src/screens/OrganizationDetailScreen.tsx',
    'src/screens/OrganizationsListScreen.tsx',
    'src/screens/SpacesListScreen.tsx',
    'src/screens/NotificationsScreen.tsx',
    'src/screens/ReferralsScreen.tsx',
    'src/screens/SettingsScreen.tsx',
    'src/screens/PreferencesScreen.tsx',
    'src/screens/LegalScreen.tsx',
    'src/screens/BeyonDScreen.tsx',
    'src/screens/SupportScreen.tsx',
]

base_path = '/Users/abhinavtej/Desktop/unifesto-3.0/mobile-apps/discover/'

def update_file(filepath):
    full_path = os.path.join(base_path, filepath)
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Skip if already using useTheme
        if 'const { colors } = useTheme()' in content:
            print(f"⏭️  {os.path.basename(filepath)}: Already using useTheme")
            return False
        
        # Step 1: Update imports - remove colors from theme import
        content = re.sub(
            r"import\s*{\s*([^}]*?)\bcolors\b,?\s*([^}]*?)}\s*from\s*['\"]\.\.\/theme['\"]",
            lambda m: f"import {{ {m.group(1)}{m.group(2)} }}".replace('{ ,', '{').replace(', }', '}').replace('  ', ' ') + " from '../theme'",
            content
        )
        content = re.sub(
            r"import\s*{\s*([^}]*?),\s*\bcolors\b\s*([^}]*?)}\s*from\s*['\"]\.\.\/theme['\"]",
            lambda m: f"import {{ {m.group(1)},{m.group(2)} }}".replace(', }', '}').replace('  ', ' ') + " from '../theme'",
            content
        )
        
        # Step 2: Add useTheme import if not present
        if "from '../context/ThemeContext'" not in content:
            # Find AuthContext import
            auth_match = re.search(r"(import.*from\s*['\"]\.\.\/context\/AuthContext['\"];?\n)", content)
            if auth_match:
                insert_pos = auth_match.end()
                content = content[:insert_pos] + "import { useTheme } from '../context/ThemeContext';\n" + content[insert_pos:]
            else:
                # Find last component/context import
                matches = list(re.finditer(r"import.*from\s*['\"]\.\.\/(?:context|components)\/[^'\"]+['\"];?\n", content))
                if matches:
                    insert_pos = matches[-1].end()
                    content = content[:insert_pos] + "import { useTheme } from '../context/ThemeContext';\n" + content[insert_pos:]
        
        # Step 3: Add useTheme hook at start of component
        func_match = re.search(r'(export\s+default\s+function\s+\w+\([^)]*\)\s*\{)\s*\n', content)
        if func_match and 'const { colors } = useTheme();' not in content:
            insert_pos = func_match.end()
            content = content[:insert_pos] + '  const { colors } = useTheme();\n' + content[insert_pos:]
        
        if content != original:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {os.path.basename(filepath)}: Updated")
            return True
        else:
            print(f"➖ {os.path.basename(filepath)}: No changes needed")
            return False
            
    except Exception as e:
        print(f"❌ {os.path.basename(filepath)}: Error - {str(e)}")
        return False

print("🎨 Starting theme implementation...\n")
updated = 0
for filepath in files_to_update:
    if update_file(filepath):
        updated += 1

print(f"\n📊 Summary: {updated} files updated")
