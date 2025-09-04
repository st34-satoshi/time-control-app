import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Category } from '@app-types/Category';
import { CategoryManager } from '@domain/Category';

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
    <View style={{ gap: 8 }}>
      {categoryRows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((category) => {
            const isSelected = currentCategory === category.value;
            
            return (
              <TouchableOpacity
                key={category.value}
                style={{
                  flex: 1,
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
            );
          })}
          {/* Fill remaining slots in the row with empty views to maintain alignment */}
          {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, index) => (
            <View key={`empty-${index}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
};

export default Categories;
