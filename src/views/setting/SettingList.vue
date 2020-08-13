<template>
    <ul :class="s.content">
        <li :class="s.list"
            v-for="(item,index) in list"
            :key="index">
            <label> {{item.label}}：</label>
            <slot :name="item.slotName"
                :row="item">
                <div :class="s.editWrap"
                    v-if="item.type === 'input'">
                    <slot :name="item.slotItemName"></slot>
                    <edit-item :value="item.value"
                                :type ="item.inputType"
                        @confirm="(val)=>$emit('item-confirm',{val,item})"></edit-item>
                </div>
                <div v-else-if="item.type === 'custom'">
                  <slot :name="item.slotItemName"></slot>
                </div>
                <div v-else>
                    <span >{{ item.value || '未设置' }}</span>
                    <i @click="$emit('editEvent',item)"
                        :class="['ewen-iconbianji',s.icon]"></i>
                </div>
            </slot>
            <slot name="right"></slot>
        </li>
    </ul>
</template>

<script>
import EditItem from './EditItem.vue';
export default {
    components: {
        EditItem,
    },
    props: {
        list: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
        };
    },
};
</script>

<style lang="scss" module="s">
.content {
  .list {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 24px;
    color: #495060;
    font-size: 14px;
    > label {
      color: #1c2438;
      margin-right: 8px;
    }
    .editWrap {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }
  .icon {
    font-size: 18px;
    color: #999;
    margin-left: 8px;
    cursor: pointer;
    &:hover {
      color: #59c993;
    }
  }
}
</style>
