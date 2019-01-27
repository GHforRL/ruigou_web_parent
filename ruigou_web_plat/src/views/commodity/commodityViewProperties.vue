<template>
    <div>
        <p v-for="(item,key) in personInfo" style="margin-top: 10px;">
            <input v-model="item.name" style="background: #eee">{{item.name}}<br>
        </p>
        <button @click="addArray">add1</button>
    </div>
</template>

<script>
    import draggable from 'vuedraggable'

    export default {
        data: function(){
            return {
                personInfo:{
                    "huangbiao":{
                        name:"--huangbiao---"
                    }
                }
            }
        },
        methods:{
            addArray:function(){
                console.dir(this.personInfo);
                var liumei = {
                    name:"--liumei---"
                };
                this.$set(this.personInfo,"liumei",liumei)
                console.dir(this.personInfo);
            }
        }
    }
</script>

<style scpoed>

    .normal {
        background-color: grey;
    }
    .drag {
        background-color: green;
    }
    .dragArea{
        min-height: 10px;
    }
</style>