import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { Category } from '@app-types/Category';
import { CategoryManager } from '@domain/Category';
import { CategoryData } from '@services/firestore/categoryService';

interface CategoriesProps {
  userId?: string;
  onCategorySelect: (categoryValue: string) => void;
  currentCategory: string;
}

const Categories: React.FC<CategoriesProps> = ({
  userId,
  onCategorySelect,
  currentCategory,
}) => {
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryManager, setCategoryManager] = useState<CategoryManager | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState<CategoryData>({
    value: '',
    label: '',
    icon: '📋'
  });
  
  // Create CategoryManager instance on mount
  useEffect(() => {
    if (userId && !categoryManager) {
      const createCategoryManager = async () => {
        try {
          const manager = await CategoryManager.create(userId);
          setCategoryManager(manager);
        } catch (error) {
          console.error('Error creating CategoryManager:', error);
        }
      };
      
      createCategoryManager();
    }
  }, [userId, categoryManager]);

  // Load categories when CategoryManager is ready
  useEffect(() => {
    if (!categoryManager || !isLoadingCategories) return;
    
    const loadCategories = () => {
      try {
        setIsLoadingCategories(true);
        
        const fetchedCategories = categoryManager.getAllCategories();
        
        // Sort categories by order property, then by label alphabetically
        const sortedCategories = fetchedCategories.sort((a, b) => {
          const orderA = a.order || 0;
          const orderB = b.order || 0;
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          return a.label.localeCompare(b.label);
        });
        
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        Alert.alert('エラー', 'カテゴリの読み込みに失敗しました');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [categoryManager]);

  const handleCategoryPress = (category: Category) => {
    onCategorySelect(category.value);
  };

  const handleEditButtonPress = () => {
    setEditingCategory(null);
    // 新規追加時は内部IDを自動生成
    const newValue = `category_${Date.now()}`;
    setEditForm({
      value: newValue,
      label: '',
      icon: '📋'
    });
    setIsEditModalVisible(true);
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setEditForm({
      value: category.value,
      label: category.label,
      icon: category.icon
    });
    setIsEditModalVisible(true);
  };


  const handleSaveCategory = async () => {
    if (!categoryManager || !editForm.value.trim() || !editForm.label.trim()) {
      Alert.alert('エラー', 'カテゴリ名と値を入力してください');
      return;
    }

    try {
      if (editingCategory) {
        // 更新
        await categoryManager.updateCategory(editingCategory.id!, editForm);
      } else {
        // 新規追加
        await categoryManager.addCategory(editForm);
      }
      
      // カテゴリ一覧を再読み込み
      await categoryManager.reloadCategories();
      const updatedCategories = categoryManager.getAllCategories();
      setCategories(updatedCategories);
      
      setIsEditModalVisible(false);
      setEditingCategory(null);
      setEditForm({ value: '', label: '', icon: '📋' });
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('エラー', 'カテゴリの保存に失敗しました');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!categoryManager) return;

    Alert.alert(
      'カテゴリを削除',
      `「${category.label}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryManager.deleteCategory(category.id!);
              await categoryManager.reloadCategories();
              const updatedCategories = categoryManager.getAllCategories();
              setCategories(updatedCategories);
              
              // ポップアップを閉じる
              setIsEditModalVisible(false);
              setEditingCategory(null);
              setEditForm({ value: '', label: '', icon: '📋' });
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('エラー', 'カテゴリの削除に失敗しました');
            }
          }
        }
      ]
    );
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingCategory(null);
    setEditForm({ value: '', label: '', icon: '📋' });
  };
  
  if (isLoadingCategories) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ textAlign: 'center', color: '#666' }}>カテゴリを読み込み中...</Text>
      </View>
    );
  }
  
  if (categories.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ textAlign: 'center', color: '#666' }}>カテゴリがありません</Text>
      </View>
    );
  }
  
  // Group categories into rows of 3
  const groupCategoriesIntoRows = (categories: Category[]) => {
    const rows = [];
    for (let i = 0; i < categories.length; i += 3) {
      rows.push(categories.slice(i, i + 3));
    }
    return rows;
  };

  const categoryRows = groupCategoriesIntoRows(categories);

  return (
    <>
      <View style={{ gap: 8 }}>
        {categoryRows.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', gap: 8 }}>
            {row.map((category) => {
              const isSelected = currentCategory === category.value;
              
              return (
                <View key={category.value} style={{ flex: 1, position: 'relative' }}>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: isSelected ? '#007AFF' : '#F0F0F0',
                      borderWidth: 1,
                      borderColor: isSelected ? '#007AFF' : '#E0E0E0',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                    onPress={() => handleCategoryPress(category)}
                  >
                    <Text 
                      style={{
                        color: isSelected ? '#FFFFFF' : '#333333',
                        fontSize: 12,
                        fontWeight: isSelected ? '600' : '400',
                        textAlign: 'center',
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {category.icon} {category.label}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Edit button */}
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#F5F5F5',
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => handleCategoryEdit(category)}
                  >
                    <Text style={{ color: '#666666', fontSize: 8, fontWeight: 'bold' }}>✏️</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            {/* Fill remaining slots in the row with empty views to maintain alignment */}
            {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, index) => (
              <View key={`empty-${index}`} style={{ flex: 1 }} />
            ))}
          </View>
        ))}
      </View>

      {/* Edit/Add Button */}
      <TouchableOpacity
        style={{
          marginTop: 12,
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: '#F5F5F5',
          borderWidth: 1,
          borderColor: '#E0E0E0',
          alignItems: 'center',
          alignSelf: 'center',
        }}
        onPress={handleEditButtonPress}
      >
        <Text style={{
          color: '#666666',
          fontSize: 11,
          fontWeight: '400',
        }}>
          ➕ カテゴリを追加
        </Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeEditModal}
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
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>アイコン</Text>
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
                  onChangeText={(text) => setEditForm({ ...editForm, icon: text })}
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
                  onChangeText={(text) => setEditForm({ ...editForm, label: text })}
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
                onPress={closeEditModal}
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
                onPress={handleSaveCategory}
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
                onPress={() => handleDeleteCategory(editingCategory)}
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
    </>
  );
};

export default Categories;
