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

<script lang="ts">

import type { Shelter, WebR } from 'webr';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    webR: WebR;
    codeShelter: Shelter;
  }
}

export default {
    mounted: async function () {
        await this.webR.init();
        this.codeShelter = await new this.webR.Shelter();

        const btnText = this.$refs.webrEditorButtonTitle as HTMLSpanElement;
        const btn = this.$refs.webrEditorButton as HTMLButtonElement;
        btnText.innerText = "Run Code";
        btn.disabled = false;
    },
    data(): {
        hasPlot: Boolean,
        form: {
            input: number,
            color: string,
            fontsize: number,
            xlabel: string,
            ylabel: string,
            title: string,
            desc: string,
        },
    } {
        return {
            hasPlot: false,
            form: {
                input: 1000,
                color: '#409eff',
                fontsize: 16,
                xlabel: 'rnorm(input)',
                ylabel: 'rnorm(input)',
                title: 'An rnorm plot',
                desc: '',
                },
        };
    },
    methods: {
        onSubmit() {
            console.log('submit!');
        },
        run: async function () {
            const btn = this.$refs.webrEditorButton as HTMLButtonElement;
            const canvas = this.$refs.webrPlotOutput as HTMLCanvasElement;
            // btn.disabled = true;
            try {
                // Run user provided code
                await this.webR.init();
                await this.webR.evalRVoid('webr::canvas(width=500, height=400)');
                await this.webR.objs.globalEnv.bind('input', this.form.input);
                await this.webR.objs.globalEnv.bind('xlabel', this.form.xlabel);
                await this.webR.objs.globalEnv.bind('ylabel', this.form.ylabel);
                await this.webR.objs.globalEnv.bind('title', this.form.title);
                await this.webR.objs.globalEnv.bind('color', this.form.color);

                // await this.webR.installPackages(['ggplot2'])
                const obj = await this.webR.evalR('.libPaths()');
                console.log(obj);

                // Get captured output
                await this.webR.evalRVoid(`
                plot(rnorm(input), rnorm(input),
                    xlab=xlabel, ylab=ylabel,
                    main=title,
                    col = color, # 设置点的颜色为蓝色
                    cex.main = 1.5, # 设置标题字体大小为1.5倍默认大小
                    cex.lab = 1.2)
                dev.off()
                `, {
                    withAutoprint: true,
                    captureStreams: true,
                    captureConditions: false,
                    env: this.webR.objs.globalEnv,
                });
                // Render plot to HTML canvas element
                const msgs = await this.webR.flush();
                this.hasPlot = false;
                msgs.forEach((msg) => {
                    if (msg.type === 'canvas' && msg.data.event === 'canvasImage') {
                        this.hasPlot = true;
                        canvas.getContext('2d')!.drawImage(msg.data.image, 0, 0);
                    } else if (msg.type === 'canvas' && msg.data.event === 'canvasNewPage') {
                        canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
                    }
                });
            } finally {
                // Destroy sheltered R objects
                this.codeShelter.purge();
                btn.disabled = false;
            }
        }
    },
};
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
