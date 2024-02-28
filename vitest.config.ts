import {defineConfig,configDefaults} from "vitest/config"


export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude,'**/hot_test/**'],
        coverage:{
            reporter:["text","html"]
        }

    }
})