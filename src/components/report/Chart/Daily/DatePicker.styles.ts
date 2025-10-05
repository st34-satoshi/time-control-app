import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  dateSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  dateSelector: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
});