import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { CustomField } from '../lib/api/tickets';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius } from '../theme';

interface CustomFieldInputProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export default function CustomFieldInput({
  field,
  value,
  onChange,
  error,
}: CustomFieldInputProps) {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing[4],
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.bold,
      color: colors.text,
      marginBottom: spacing[2],
    },
    required: {
      color: colors.error,
    },
    helpText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      marginBottom: spacing[2],
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: typography.fontFamily.primary,
    },
    inputError: {
      borderColor: colors.error,
    },
    textarea: {
      minHeight: 100,
      paddingTop: spacing[3],
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      color: colors.error,
      marginTop: spacing[1],
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.borderMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[2],
    },
    checkboxChecked: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    checkboxInner: {
      width: 10,
      height: 10,
      borderRadius: 2,
      backgroundColor: '#000000',
    },
    checkboxLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: typography.fontFamily.primary,
    },
    optionsContainer: {
      gap: spacing[2],
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.backgroundSecondary,
    },
    radioOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(52, 145, 255, 0.05)',
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.borderMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[3],
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    radioLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.primary,
    },
    radioLabelSelected: {
      color: colors.primary,
      fontFamily: typography.fontFamily.bold,
    },
    dropdownContainer: {
      gap: spacing[2],
    },
    dropdownOption: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.backgroundSecondary,
    },
    dropdownOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(52, 145, 255, 0.05)',
    },
    dropdownLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.primary,
    },
    dropdownLabelSelected: {
      color: colors.primary,
      fontFamily: typography.fontFamily.bold,
    },
    multiSelectOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.backgroundSecondary,
    },
    multiSelectOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(52, 145, 255, 0.05)',
    },
    multiSelectLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.primary,
    },
    multiSelectLabelSelected: {
      color: colors.primary,
      fontFamily: typography.fontFamily.bold,
    },
    fileUploadContainer: {
      gap: spacing[2],
    },
    fileUploadButton: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      alignItems: 'center',
    },
    fileUploadButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.bold,
      color: colors.text,
    },
    fileUploadText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
    },
  });

  const renderField = () => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={field.placeholder || field.label}
            placeholderTextColor={colors.textMuted}
            value={value || ''}
            onChangeText={onChange}
            keyboardType={
              field.field_type === 'email'
                ? 'email-address'
                : field.field_type === 'phone'
                ? 'phone-pad'
                : field.field_type === 'url'
                ? 'url'
                : 'default'
            }
            autoCapitalize={field.field_type === 'email' || field.field_type === 'url' ? 'none' : 'sentences'}
          />
        );

      case 'textarea':
        return (
          <TextInput
            style={[styles.input, styles.textarea, error && styles.inputError]}
            placeholder={field.placeholder || field.label}
            placeholderTextColor={colors.textMuted}
            value={value || ''}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        );

      case 'number':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={field.placeholder || field.label}
            placeholderTextColor={colors.textMuted}
            value={value?.toString() || ''}
            onChangeText={(text) => {
              const num = parseFloat(text);
              onChange(isNaN(num) ? '' : num);
            }}
            keyboardType="numeric"
          />
        );

      case 'date':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={field.placeholder || 'YYYY-MM-DD'}
            placeholderTextColor={colors.textMuted}
            value={value || ''}
            onChangeText={onChange}
          />
        );

      case 'checkbox':
        return (
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => onChange(!value)}
          >
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
              {value && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.checkboxLabel}>{field.label}</Text>
          </TouchableOpacity>
        );

      case 'radio':
        return (
          <View style={styles.optionsContainer}>
            {field.options_json?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radioOption,
                  value === option.value && styles.radioOptionSelected,
                ]}
                onPress={() => onChange(option.value)}
              >
                <View style={styles.radioButton}>
                  {value === option.value && <View style={styles.radioButtonInner} />}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    value === option.value && styles.radioLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'dropdown':
        return (
          <View style={styles.dropdownContainer}>
            {field.options_json?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  value === option.value && styles.dropdownOptionSelected,
                ]}
                onPress={() => onChange(option.value)}
              >
                <Text
                  style={[
                    styles.dropdownLabel,
                    value === option.value && styles.dropdownLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'multi_select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <View style={styles.optionsContainer}>
            {field.options_json?.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.multiSelectOption,
                    isSelected && styles.multiSelectOptionSelected,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      onChange(selectedValues.filter((v) => v !== option.value));
                    } else {
                      onChange([...selectedValues, option.value]);
                    }
                  }}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                    {isSelected && <View style={styles.checkboxInner} />}
                  </View>
                  <Text
                    style={[
                      styles.multiSelectLabel,
                      isSelected && styles.multiSelectLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'country':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={field.placeholder || 'Select country'}
            placeholderTextColor={colors.textMuted}
            value={value || ''}
            onChangeText={onChange}
          />
        );

      case 'id_proof_type':
        const idProofTypes = [
          { label: 'Passport', value: 'passport' },
          { label: 'Driver License', value: 'driver_license' },
          { label: 'National ID', value: 'national_id' },
          { label: 'Student ID', value: 'student_id' },
        ];
        return (
          <View style={styles.optionsContainer}>
            {idProofTypes.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radioOption,
                  value === option.value && styles.radioOptionSelected,
                ]}
                onPress={() => onChange(option.value)}
              >
                <View style={styles.radioButton}>
                  {value === option.value && <View style={styles.radioButtonInner} />}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    value === option.value && styles.radioLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'file':
      case 'id_proof_upload':
        return (
          <View style={styles.fileUploadContainer}>
            <TouchableOpacity style={styles.fileUploadButton}>
              <Text style={styles.fileUploadButtonText}>
                {value ? 'File Selected' : 'Choose File'}
              </Text>
            </TouchableOpacity>
            {value && (
              <Text style={styles.fileUploadText} numberOfLines={1}>
                {value.name || 'File selected'}
              </Text>
            )}
          </View>
        );

      default:
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={field.placeholder || field.label}
            placeholderTextColor={colors.textMuted}
            value={value || ''}
            onChangeText={onChange}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {field.field_type !== 'checkbox' && (
        <Text style={styles.label}>
          {field.label}
          {field.is_required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      {field.help_text && <Text style={styles.helpText}>{field.help_text}</Text>}
      {renderField()}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
