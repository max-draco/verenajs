import s from './index.module.css';
export function createSpacer({size='md',axis='vertical'}){const sp=document.createElement('div');sp.className=`${s.spacer} ${s[axis]} ${s[size]}`;return sp;}