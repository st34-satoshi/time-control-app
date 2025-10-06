import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  monthSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  monthSelectorRow: {
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
  monthSelector: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  monthSelectorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  monthRangeText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
