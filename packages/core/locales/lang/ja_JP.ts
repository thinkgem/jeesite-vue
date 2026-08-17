import { genMessage } from '../helper';
import antdLocale from 'antdv-next/locale/zh_CN';

const modules = import.meta.glob('../../../**/locales/lang/ja_JP/**/*.ts', {
  eager: true,
});

export default {
  message: {
    ...genMessage(modules as Recordable<Recordable>, 'ja_JP'),
    antdLocale,
  },
  dateLocale: null,
  dateLocaleName: 'ja-jp',
};
