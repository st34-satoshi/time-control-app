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
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Load categories on component mount
  useEffect(() => {
    if(!isLoadingCategories) return;
    const loadCategories = async () => {
      if (userId) {
        try {
          setIsLoadingCategories(true);
          const fetchedCategories = await CategoryManager.getAllCategories(userId);
          setCategories(fetchedCategories);
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
  
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: currentCategory === category.value ? '#007AFF' : '#F0F0F0',
            borderWidth: 1,
            borderColor: currentCategory === category.value ? '#007AFF' : '#E0E0E0',
          }}
          onPress={() => onCategorySelect(category.value)}
        >
          <Text style={{
            color: currentCategory === category.value ? '#FFFFFF' : '#333333',
            fontSize: 14,
            fontWeight: currentCategory === category.value ? '600' : '400',
          }}>
            {category.icon} {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Categories;
