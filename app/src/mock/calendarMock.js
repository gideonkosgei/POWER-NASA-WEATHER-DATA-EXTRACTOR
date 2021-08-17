import uuid from 'uuid/v1';
import moment from 'moment';
import { colors } from '@material-ui/core';

import mock from 'utils/mock';

mock.onGet('/api/calendar').reply(200, {
  draft: [],
  events: [
    {
      id: uuid(),
      title: 'Call Dr.Samantha',
      desc: 'conduct AI',
      color: colors.green['700'],
      start: moment('2019-07-01 16:55:00'),
      end: moment('2019-07-01 17:02:00')
    },
    {
      id: uuid(),
      title: 'Expected Calving',
      desc: 'Expecting a New Calf to be born',
      start: moment('2019-07-03 08:55:00'),
      end: moment('2019-07-04 15:02:00')
    },
    {
      id: uuid(),
      title: 'Animal X exit',
      desc: 'Prepare documentation',
      allDay: true,
      start: moment('2019-07-14 16:55:00')
    },
    {
      id: uuid(),
      title: 'Test',
      desc: 'Test Calender desctiption',
      allDay: true,
      start: moment('2019-07-18 07:00:00')
    },
    {
      id: uuid(),
      title: 'Fire John',
      desc: 'Sorry, John',
      color: colors.green['700'],
      start: moment('2019-07-20 08:55:00'),
      end: moment('2019-07-20 09:30:00')
    },
    {
      id: uuid(),
      title: 'Call Dr.Alex',
      desc: 'Discuss stuff',
      allDay: true,
      start: moment('2019-07-30 08:00:00')
    },
    {
      id: uuid(),
      title: 'Visit Farm x',
      color: colors.green['700'],
      desc: 'bench-marking',
      start: moment('2019-07-30 08:00:00'),
      end: moment('2019-07-30 09:00:00')
    }
  ]
});
