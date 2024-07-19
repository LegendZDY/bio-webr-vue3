<template>
    <div class="webr-form">
        <el-form :model="form" label-width="auto" style="max-width: 600px">
            <el-form-item label="Input number">
                <el-input v-model="form.input" type="number" />
            </el-form-item>
            <el-form-item label="Choose color">
                <el-color-picker v-model="form.color" />
            </el-form-item>
            <el-form-item label="Font size">
                <el-select v-model="form.fontsize" placeholder="please select your zone">
                <el-option value="12" />
                <el-option value="13" />
                <el-option value="14" />
                <el-option value="15" />
                <el-option value="16" />
                <el-option value="17" />
                <el-option value="18" />
                <el-option value="19" />
                <el-option value="20" />
                </el-select>
            </el-form-item>
            <el-form-item label="Activity time">
                <el-col :span="11">
                <el-date-picker
                    v-model="form.date1"
                    type="date"
                    placeholder="Pick a date"
                    style="width: 100%"
                />
                </el-col>
                <el-col :span="2" class="text-center">
                <span class="text-gray-500">-</span>
                </el-col>
                <el-col :span="11">
                <el-time-picker
                    v-model="form.date2"
                    placeholder="Pick a time"
                    style="width: 100%"
                />
                </el-col>
            </el-form-item>
            <el-form-item label="Instant delivery">
                <el-switch v-model="form.delivery" />
            </el-form-item>
            <el-form-item label="Activity type">
                <el-checkbox-group v-model="form.type">
                <el-checkbox value="Online activities" name="type">
                    Online activities
                </el-checkbox>
                <el-checkbox value="Promotion activities" name="type">
                    Promotion activities
                </el-checkbox>
                <el-checkbox value="Offline activities" name="type">
                    Offline activities
                </el-checkbox>
                <el-checkbox value="Simple brand exposure" name="type">
                    Simple brand exposure
                </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item label="Resources">
                <el-radio-group v-model="form.resource">
                <el-radio value="Sponsor">Sponsor</el-radio>
                <el-radio value="Venue">Venue</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Activity form">
                <el-input v-model="form.desc" type="textarea" />
            </el-form-item>
            <el-form-item>
                <el-button 
                    type="primary" 
                    ref="webrEditorButton" 
                    class="webr-editor-btn"
                    @click="run">
                        &#x25B6; <span ref="webrEditorButtonTitle">Loading...</span>
                </el-button>
                <el-button>Cancel</el-button>
            </el-form-item>
        </el-form>
    </div>
    <canvas
    class="webr-plot-output"
    v-show="hasPlot"
    width="1000"
    height="800"
    ref="webrPlotOutput">
    </canvas>
</template>

<script setup lang="ts">

import { WebR, Shelter, ChannelType } from 'webr';

import { ref, onMounted, } from 'vue'

const webR = new WebR({
    channelType: ChannelType.PostMessage,
    });
const webrEditorButtonTitle = ref();

 // 生命周期钩子
 onMounted(async ()=>{
    console.log('开始初始化')
    await webR.init();
    // const codeShelter = await new webR.Shelter();
    await webR.FS.mkdir('/data');
    await webR.FS.mount('IDBFS', {}, '/data');

    // Populate the `/data` directory from IndexedDB. The first time, this will be empty
    await webR.FS.syncfs(true);
    await webR.evalR('.libPaths(c("/data/library", .libPaths()))');
    
    try {
        await webR.evalR('library("ggplot2")');
        console.log('ggplot2 already installed!');
    } catch (error) {
        console.log('ggplot2 not installed, installing now...');
        // Install R packages to `/data/library`
        // NOTE: The `mount = FALSE` argument is very important here
        await webR.evalRVoid("webr::install('ggplot2', lib = '/data/library', mount = FALSE)")

        // Synchronise to write the packages' file data to IndexedDB
        await webR.FS.syncfs(false);
        console.log('ggplot2 installed!');
        await webR.evalR('library("ggplot2")');
    }
    const btnText = webrEditorButtonTitle.value as HTMLSpanElement;
    btnText.innerText = "Run Code";
    console.log('初始化完成')
})


</script>

<style scoped>
.webr-form {
  float: right;
  width: 50%;
  box-sizing: border-box;
  padding: 1rem;
}

.webr-plot-output {
  display: block;
  width: 50%;
  box-sizing: border-box;
  padding: 1rem;
}
.webr-editor-btn {
    float: right;
    padding: 0.2rem
}
</style>
