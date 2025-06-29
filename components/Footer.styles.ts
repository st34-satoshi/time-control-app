import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
    marginTop: 4,
  },
}); 