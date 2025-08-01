import type {RecursiveRequired, Settings} from '#/global'
import {cloneDeep} from 'es-toolkit'
import settingsDefault from '@/settings.default'
import {merge} from '@/utils/object'

const globalSettings: Settings.all = {
  "menu": {
    "mode": "head",
    "enableSubMenuCollapseButton": true
  },
  "tabbar": {
    "enableIcon": false
  },
  "navSearch": {
    "enableHotkeys": false
  }
}

export default merge(globalSettings, cloneDeep(settingsDefault)) as RecursiveRequired<Settings.all>
