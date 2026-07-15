<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
-->
<template>
  <Tabs :activeKey="activeKey" @change="handleTabChange">
    <TabPane key="/sys/audit/list">
      <template #tab>
        <Icon icon="i-ant-design:safety-outlined" class="pr-1" />
        <span>{{ t('账号密码审计') }}</span>
      </template>
    </TabPane>
    <TabPane key="/sys/audit/userList">
      <template #tab>
        <Icon icon="i-ant-design:menu-outlined" class="pr-1" />
        <span>{{ t('菜单权限审计') }}</span>
      </template>
    </TabPane>
    <TabPane key="/sys/audit/menuList">
      <template #tab>
        <Icon icon="i-ant-design:team-outlined" class="pr-1" />
        <span>{{ t('用户权限审计') }}</span>
      </template>
    </TabPane>
  </Tabs>
</template>
<script lang="ts" setup name="AuditTabs">
  import { useRouter } from 'vue-router';
  import { Tabs, TabPane } from 'antdv-next';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { Icon } from '@jeesite/core/components/Icon';

  defineProps<{ activeKey: string }>();

  const { t } = useI18n('bpm.button');
  const router = useRouter();

  function handleTabChange(key: string) {
    router.push(key);
  }
</script>
