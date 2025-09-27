import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { Category } from '@app-types/Category';
import { CategoryData } from '@services/firestore/categoryService';
import { styles } from './EditCategory.styles';

interface EditCategoryProps {
  visible: boolean;
  editingCategory: Category | null;
  editForm: CategoryData;
  onClose: () => void;
  onSave: () => void;
  onDelete: (category: Category) => void;
  onFormChange: (form: CategoryData) => void;
}

// プリセットカラー（グラフで見やすい色を選択）
const PRESET_COLORS = [
  '#3b82f6', // 青
  '#ef4444', // 赤
  '#10b981', // 緑
  '#f59e0b', // オレンジ
  '#8b5cf6', // 紫
  '#06b6d4', // シアン
  '#84cc16', // ライム
  '#f97316', // オレンジ
  '#ec4899', // ピンク
  '#6b7280', // グレー
];

const EditCategory: React.FC<EditCategoryProps> = ({
  visible,
  editingCategory,
  editForm,
  onClose,
  onSave,
  onDelete,
  onFormChange,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('');

  const handleIconChange = (text: string) => {
    onFormChange({ ...editForm, icon: text });
  };

  const handleLabelChange = (text: string) => {
    onFormChange({ ...editForm, label: text });
  };

  const handleColorChange = (color: string) => {
    onFormChange({ ...editForm, color: color });
    setShowColorPicker(false);
  };

  const handleCustomColorChange = (text: string) => {
    setCustomColor(text);
  };

  const handleCustomColorSubmit = () => {
    if (customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      handleColorChange(customColor);
      setCustomColor('');
    }
  };

  const handleDelete = () => {
    if (editingCategory) {
      onDelete(editingCategory);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 24,
          margin: 20,
          minWidth: 300,
          maxHeight: '80%',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 20,
            textAlign: 'center',
          }}>
            {editingCategory ? 'カテゴリを編集' : 'カテゴリを追加'}
          </Text>
          
          <ScrollView style={{ maxHeight: 400 }}>
            {/* Icon Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>アイコン(絵文字を1文字)</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  fontSize: 16,
                }}
                value={editForm.icon}
                onChangeText={handleIconChange}
                placeholder="📋"
              />
            </View>

            {/* Label Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>カテゴリ名</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  fontSize: 16,
                }}
                value={editForm.label}
                onChangeText={handleLabelChange}
                placeholder="睡眠"
              />
            </View>

            {/* Color Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>色</Text>
              
              {/* Current Color Display */}
              <TouchableOpacity
                style={[
                  styles.colorButton,
                  { backgroundColor: editForm.color || '#3b82f6' }
                ]}
                onPress={() => setShowColorPicker(true)}
              >
                <Text style={styles.colorButtonText}>
                  {editForm.color || '#3b82f6'}
                </Text>
              </TouchableOpacity>

              {/* Color Picker Modal */}
              <Modal
                visible={showColorPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowColorPicker(false)}
              >
                <View style={styles.colorPickerOverlay}>
                  <View style={styles.colorPickerContainer}>
                    <Text style={styles.colorPickerTitle}>色を選択</Text>
                    
                    {/* Preset Colors */}
                    <View style={styles.presetColorsContainer}>
                      <Text style={styles.sectionTitle}>デフォルトカラー</Text>
                      <View style={styles.presetColorsGrid}>
                        {PRESET_COLORS.map((color) => (
                          <TouchableOpacity
                            key={color}
                            style={[
                              styles.colorOption,
                              { backgroundColor: color },
                              editForm.color === color && styles.selectedColorOption
                            ]}
                            onPress={() => handleColorChange(color)}
                          />
                        ))}
                      </View>
                    </View>

                    {/* Custom Color Input */}
                    <View style={styles.customColorContainer}>
                      <Text style={styles.sectionTitle}>カスタムカラー</Text>
                      <View style={styles.customColorInputContainer}>
                        <TextInput
                          style={styles.customColorInput}
                          value={customColor}
                          onChangeText={handleCustomColorChange}
                          placeholder="#000000"
                          placeholderTextColor="#999"
                        />
                        <TouchableOpacity
                          style={styles.customColorButton}
                          onPress={handleCustomColorSubmit}
                        >
                          <Text style={styles.customColorButtonText}>適用</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowColorPicker(false)}
                    >
                      <Text style={styles.closeButtonText}>閉じる</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: '#E0E0E0',
                alignItems: 'center',
              }}
              onPress={onClose}
            >
              <Text style={{
                color: '#666666',
                fontSize: 16,
                fontWeight: '500',
              }}>
                キャンセル
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: '#007AFF',
                alignItems: 'center',
              }}
              onPress={onSave}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '500',
              }}>
                {editingCategory ? '更新' : '追加'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delete Button (only for editing) */}
          {editingCategory && (
            <TouchableOpacity
              style={{
                marginTop: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: '#FF3B30',
                alignItems: 'center',
              }}
              onPress={handleDelete}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '500',
              }}>
                削除
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default EditCategory;
