<script lang="ts">
import type { Shelter, WebR } from 'webr';
import type { Message } from 'webr/chan/message';

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
        input: string,
        output: string,
        hasPlot: Boolean
    } {
        return {
            input: "",
            output: '',
            hasPlot: false,
        };
    },
    methods: {
        run: async function () {
            const btn = this.$refs.webrEditorButton as HTMLButtonElement;
            const canvas = this.$refs.webrPlotOutput as HTMLCanvasElement;
            btn.disabled = true;
            try {
                // Run user provided code
                await this.webR.init();
                await this.webR.evalRVoid('webr::canvas(width=500, height=400)');
                const result = await this.codeShelter.captureR("hist(rnorm(10000))", {
                    withAutoprint: true,
                    captureStreams: true,
                    captureConditions: false,
                    env: this.webR.objs.globalEnv,
                });
                await this.webR.evalRVoid('dev.off()');

                // Get captured output
                this.output = result.output.filter(
                    (msg) => (msg as Message).type == 'stdout' || (msg as Message).type == 'stderr'
                ).map((msg) => (msg as Message).data).join('\n');

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

<template>
  <div>
    <button
    ref="webrEditorButton"
    disabled="true"
    class="webr-editor-btn"
    @click="run" >
        &#x25B6; <span ref="webrEditorButtonTitle">Loading...</span>
    </button>
  </div>
  <canvas
    class="webr-plot-output"
    v-show="hasPlot"
    width="1000"
    height="800"
    ref="webrPlotOutput">
    </canvas>
</template>

<style scoped>
.webr-editor-btn {
    float: right;
    padding: 0.2rem
}
.webr-plot-output {
    display: block;
    width: 640px;
}
</style>
