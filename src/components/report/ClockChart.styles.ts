import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  clockContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clockTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pieChart: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  timeSegment: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    top: 2,
    left: 92.5,
  },
  centerInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  centerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  timeList: {
    maxHeight: 200,
  },
  timeListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  timeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeHour: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  timeCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  timeTask: {
    fontSize: 11,
    color: '#9ca3af',
  },
  timeDuration: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});
