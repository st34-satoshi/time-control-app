import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { Category } from '@app-types/Category';
import { CategoryData } from '@services/firestore/categoryService';

interface EditCategoryProps {
  visible: boolean;
  editingCategory: Category | null;
  editForm: CategoryData;
  onClose: () => void;
  onSave: () => void;
  onDelete: (category: Category) => void;
  onFormChange: (form: CategoryData) => void;
}

const EditCategory: React.FC<EditCategoryProps> = ({
  visible,
  editingCategory,
  editForm,
  onClose,
  onSave,
  onDelete,
  onFormChange,
}) => {
  const handleIconChange = (text: string) => {
    onFormChange({ ...editForm, icon: text });
  };

  const handleLabelChange = (text: string) => {
    onFormChange({ ...editForm, label: text });
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
                placeholder="カテゴリ名を入力"
              />
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
