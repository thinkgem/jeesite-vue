<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <PageWrapper :sidebarWidth="300" :contentFullHeight="true">
    <template #sidebar>
      <BasicTree
        ref="treeRef"
        :title="t('模板目录')"
        :search="true"
        :toolbar="true"
        :showIcon="true"
        :api="cmsTemplateTreeData"
        :immediate="true"
        :defaultExpandLevel="2"
        @click="handleTreeClick"
      >
        <template #headerTitle>
          <span class="cursor-pointer">{{ t('模板目录') }}</span>
        </template>
      </BasicTree>
    </template>
    <TemplateForm :fileName="currentFileName" @success="handleSuccess" />
  </PageWrapper>
</template>
<script lang="ts" setup name="ViewsCmsTemplateIndex">
  import { ref } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { PageWrapper } from '@jeesite/core/components/Page';
  import { BasicTree, TreeActionType } from '@jeesite/core/components/Tree';
  import { cmsTemplateTreeData } from '@jeesite/cms/api/cms/template';
  import TemplateForm from './form.vue';

  const { t } = useI18n('cms.template');
  const currentFileName = ref<string>('');
  const treeRef = ref<Nullable<TreeActionType>>(null);

  // 点击树节点：目录不加载内容，文件加载内容编辑
  function handleTreeClick(_e: any, tree: any) {
    currentFileName.value = tree.isDirectory ? '' : tree.id;
  }

  // 保存或删除成功后刷新目录树
  function handleSuccess() {
    treeRef.value?.reload();
  }
</script>
