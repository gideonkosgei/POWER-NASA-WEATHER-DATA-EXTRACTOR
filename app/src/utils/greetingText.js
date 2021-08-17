import moment from 'moment';

export default () => {
    const now = moment();
    const currentHour = now.hour();
      if (currentHour >= 12 && currentHour <=17) return "Good Afternoon,"
      else if (currentHour >= 18) return "Good Evening,"
      else return "Good Morning,"
  }