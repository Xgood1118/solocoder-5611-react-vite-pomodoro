import { format, subDays, startOfDay, isToday as dateFnsIsToday, parseISO } from 'date-fns'

export function getTodayKey() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function isToday(dateStr) {
  return dateFnsIsToday(parseISO(dateStr))
}

export function getDateRange(days) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    result.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return result
}

export function getHourFromTimestamp(ts) {
  return new Date(ts).getHours()
}

export function formatDateLabel(dateStr) {
  return format(parseISO(dateStr), 'MM/dd')
}
