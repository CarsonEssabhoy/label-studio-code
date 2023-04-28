import React from 'react';
import { Checkbox, Modal, Table, Tabs } from 'antd';
import { observer } from 'mobx-react';

import { Hotkey } from '../../core/Hotkey';

import './Settings.styl';
import { Block, Elem } from '../../utils/bem';
import { triggerResizeEvent } from '../../utils/utilities';

import EditorSettings from '../../core/settings/editorsettings';
import * as TagSettings from './TagSettings';
import { useMemo } from 'react';

const HotkeysDescription = () => {
  const columns = [
    { title: 'Shortcut', dataIndex: 'combo', key: 'combo' },
    { title: 'Description', dataIndex: 'descr', key: 'descr' },
  ];

  const keyNamespaces = Hotkey.namespaces();

  const getData = (descr) => Object.keys(descr)
    .filter(k => descr[k])
    .map(k => ({
      key: k,
      combo: k.split(',').map(keyGroup => {
        return (
          <Elem name="key-group" key={keyGroup}>
            {keyGroup.trim().split('+').map((k) => <Elem tag="kbd" name="key" key={k}>{k}</Elem>)}
          </Elem>
        );
      }),
      descr: descr[k],
    }));

  return (
    <Block name="keys">
      <Tabs size="small">
        {Object.entries(keyNamespaces).map(([ns, data]) => {
          if (Object.keys(data.descriptions).length === 0) {
            return null;
          } else {
            return (
              <Tabs.TabPane key={ns} tab={data.description ?? ns}>
                <Table columns={columns} dataSource={getData(data.descriptions)} size="small" />
              </Tabs.TabPane>
            );
          }
        })}
      </Tabs>
    </Block>
  );
};



const GeneralSettings = observer(({ store }) => {
  return (
    <Block name="settings">
      {Object.keys(EditorSettings).map((obj, index) => {
        return (
          <Elem name="field" key={index}>
            <Checkbox
              key={index}
              checked={store.settings[obj]}
              onChange={store.settings[EditorSettings[obj].onChangeEvent]}
            >
              {EditorSettings[obj].description}
            </Checkbox>
            <br />
          </Elem>
        );
      })}
    </Block>
  );
});

const LayoutSettings = observer(({ store }) => {
  return (
    <Block name="settings">
      <Elem name="field">
        <Checkbox
          checked={store.settings.bottomSidePanel}
          onChange={() => {
            store.settings.toggleBottomSP();
            setTimeout(triggerResizeEvent);
          }}
        >
              Move sidepanel to the bottom
        </Checkbox>
      </Elem>

      <Elem name="field">
        <Checkbox checked={store.settings.displayLabelsByDefault} onChange={store.settings.toggleSidepanelModel}>
            Display Labels by default in Results panel
        </Checkbox>
      </Elem>

      <Elem name="field">
        <Checkbox
          value="Show Annotations panel"
          defaultChecked={store.settings.showAnnotationsPanel}
          onChange={() => {
            store.settings.toggleAnnotationsPanel();
          }}
        >
            Show Annotations panel
        </Checkbox>
      </Elem>

      <Elem name="field">
        <Checkbox
          value="Show Predictions panel"
          defaultChecked={store.settings.showPredictionsPanel}
          onChange={() => {
            store.settings.togglePredictionsPanel();
          }}
        >
              Show Predictions panel
        </Checkbox>
      </Elem>

      {/* Saved for future use */}
      {/* <Elem name="field">
        <Checkbox
          value="Show image in fullsize"
          defaultChecked={store.settings.imageFullSize}
          onChange={() => {
            store.settings.toggleImageFS();
          }}
        >
          Show image in fullsize
        </Checkbox>

      </Elem> */}
    </Block>
  );
});

const Settings = {
  General: { name: 'General', component: GeneralSettings },
  Hotkeys: { name: 'Hotkeys', component: HotkeysDescription },
  Layout: { name: 'Layout', component: LayoutSettings },
};

const DEFAULT_ACTIVE = Object.keys(Settings)[0];

export default observer(({ store }) => {
  const availableSettings = useMemo(() => {
    const availableTags = Object.values(store.annotationStore.names.toJSON());
    const settingsScreens = Object.values(TagSettings);

    return availableTags.reduce((res, tagName) => {
      const tagType = store.annotationStore.names.get(tagName).type;
      const settings = settingsScreens.find(({ tagName }) => tagName.toLowerCase() === tagType.toLowerCase());

      if (settings) res.push(settings);

      return res;
    }, []);
  }, []);

  return (
    <Modal
      visible={store.showingSettings}
      title="Settings"
      bodyStyle={{ paddingTop: '0' }}
      footer=""
      onCancel={store.toggleSettings}
    >
      <Tabs defaultActiveKey={DEFAULT_ACTIVE}>
        {Object.entries(Settings).map(([key, { name, component }]) => (
          <Tabs.TabPane tab={name} key={key}>
            {React.createElement(component, { store })}
          </Tabs.TabPane>
        ))}
        {availableSettings.map((Page) => (
          <Tabs.TabPane tab={Page.title} key={Page.tagName}>
            <Page store={store}/>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Modal>
  );
});
