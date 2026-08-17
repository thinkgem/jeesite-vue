import { genMessage } from '../helper';
import antdLocale from 'antdv-next/locale/zh_CN';

const modules = import.meta.glob('../../../**/locales/lang/zh_TW/**/*.ts', {
  eager: true,
});

export default {
  message: {
    ...genMessage(modules as Recordable<Recordable>, 'zh_TW'),
    antdLocale,
  },
  dateLocale: null,
  dateLocaleName: 'zh-tw',
};
