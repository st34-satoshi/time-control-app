import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { Category } from '@app-types/Category';
import { CategoryManager } from '@domain/Category';

interface CategoriesProps {
  userId?: string;
  onCategorySelect: (categoryValue: string) => void;
  currentCategory: string;
}

interface GroupedCategory {
  baseName: string;
  baseCategory: Category;
  subCategories: Category[];
}

const Categories: React.FC<CategoriesProps> = ({
  userId,
  onCategorySelect,
  currentCategory,
}) => {
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupedCategory | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Group categories by base name
  const groupCategories = (categories: Category[]): GroupedCategory[] => {
    const groups: { [key: string]: GroupedCategory } = {};
    
    categories.forEach(category => {
      const parts = category.label.split('|');
      const baseName = parts[0];
      
      if (!groups[baseName]) {
        // Find the base category (without subcategory)
        const baseCategory = categories.find(c => c.label === baseName) || category;
        groups[baseName] = {
          baseName,
          baseCategory,
          subCategories: []
        };
      }else{
        if (parts.length > 1) {
          groups[baseName].subCategories.push(category);
        }
      }
    });
    
    // Sort groups by base category order, then by baseName if order is the same
    const sortedGroups = Object.values(groups).sort((a, b) => {
      const orderA = a.baseCategory.order || 0;
      const orderB = b.baseCategory.order || 0;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // If order is the same, sort alphabetically by baseName
      return a.baseName.localeCompare(b.baseName);
    });
    
    return sortedGroups;
  };
  
  // Load categories on component mount
  useEffect(() => {
    if(!isLoadingCategories) return;
    const loadCategories = async () => {
      if (userId) {
        try {
          setIsLoadingCategories(true);
          const fetchedCategories = await CategoryManager.getAllCategories(userId);
          setCategories(fetchedCategories);
          const grouped = groupCategories(fetchedCategories);
          setGroupedCategories(grouped);
        } catch (error) {
          console.error('Error loading categories:', error);
          Alert.alert('エラー', 'カテゴリの読み込みに失敗しました');
        } finally {
          setIsLoadingCategories(false);
        }
      }
    };
    
    loadCategories();
  }, [userId]);

  const handleCategoryPress = (group: GroupedCategory) => {
    if (group.subCategories.length === 0) {
      // No subcategories, select directly
      onCategorySelect(group.baseCategory.value);
    } else {
      // Has subcategories, show modal
      setSelectedGroup(group);
      setIsModalVisible(true);
    }
  };

  const handleSubCategorySelect = (category: Category) => {
    onCategorySelect(category.value);
    setIsModalVisible(false);
    setSelectedGroup(null);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedGroup(null);
  };
  
  if (isLoadingCategories) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ textAlign: 'center', color: '#666' }}>カテゴリを読み込み中...</Text>
      </View>
    );
  }
  
  if (groupedCategories.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ textAlign: 'center', color: '#666' }}>カテゴリがありません</Text>
      </View>
    );
  }
  
  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {groupedCategories.map((group) => (
          <TouchableOpacity
            key={group.baseName}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: currentCategory === group.baseCategory.value ? '#007AFF' : '#F0F0F0',
              borderWidth: 1,
              borderColor: currentCategory === group.baseCategory.value ? '#007AFF' : '#E0E0E0',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
            onPress={() => handleCategoryPress(group)}
          >
            <Text style={{
              color: currentCategory === group.baseCategory.value ? '#FFFFFF' : '#333333',
              fontSize: 14,
              fontWeight: currentCategory === group.baseCategory.value ? '600' : '400',
            }}>
              {group.baseCategory.icon} {group.baseName}
            </Text>
            {group.subCategories.length > 0 && (
              <Text style={{
                color: currentCategory === group.baseCategory.value ? '#FFFFFF' : '#666666',
                fontSize: 12,
              }}>
                ▶
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Subcategory Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
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
              {selectedGroup?.baseName} を選択
            </Text>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {/* Base category option */}
              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: currentCategory === selectedGroup?.baseCategory.value ? '#007AFF' : '#F8F8F8',
                  marginBottom: 8,
                }}
                onPress={() => handleSubCategorySelect(selectedGroup!.baseCategory)}
              >
                <Text style={{
                  color: currentCategory === selectedGroup?.baseCategory.value ? '#FFFFFF' : '#333333',
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                  {selectedGroup?.baseCategory.icon} {selectedGroup?.baseName}
                </Text>
              </TouchableOpacity>

              {/* Subcategories */}
              {selectedGroup?.subCategories.map((subCategory) => (
                <TouchableOpacity
                  key={subCategory.value}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: currentCategory === subCategory.value ? '#007AFF' : '#F8F8F8',
                    marginBottom: 8,
                  }}
                  onPress={() => handleSubCategorySelect(subCategory)}
                >
                  <Text style={{
                    color: currentCategory === subCategory.value ? '#FFFFFF' : '#333333',
                    fontSize: 16,
                    fontWeight: '500',
                  }}>
                    {subCategory.icon} {subCategory.label.split('|')[1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={{
                marginTop: 20,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: '#E0E0E0',
                alignItems: 'center',
              }}
              onPress={closeModal}
            >
              <Text style={{
                color: '#666666',
                fontSize: 16,
                fontWeight: '500',
              }}>
                キャンセル
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Categories;
