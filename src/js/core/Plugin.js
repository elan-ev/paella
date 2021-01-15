import PlayerResource from './PlayerResource';

export function importPlugins(player,context) {
    const config = player.config;
    context.keys().forEach(key => {
        const module = context(key);
        const PluginClass = module.default;
        const pluginInstance = new PluginClass(player, config, key.substring(2,key.length - 3));
        const type = pluginInstance.type;
        player.__pluginData__.pluginClasses[key] = PluginClass;
        player.__pluginData__.pluginInstances[type] = player.__pluginData__.pluginInstances[type] || [];
        player.__pluginData__.pluginInstances[type].push(pluginInstance);
    });
}

export function registerPlugins(player) {
    const config = player.config;
    player.__pluginData__ = player.__pluginData__ || {
        pluginClasses: [],
        pluginInstances: {}
    };

    // If the s_pluginClasses array is not empty, the plugins have already been registered
    if (player.__pluginData__.pluginClasses.length !== 0) return;

    // Import plugins
    const pluginContext = require.context('../plugins', true, /\.js/);
    importPlugins(player,pluginContext);
    const layoutContext = require.context('../layouts', true, /\.js/);
    importPlugins(player,layoutContext);

    console.debug("Plugins have been registered:")

    // Sort plugins
    for (const type in player.__pluginData__.pluginInstances) {
        player.__pluginData__.pluginInstances[type].sort((a,b) => a.order - b.order);
        player.__pluginData__.pluginInstances[type].forEach(p => console.debug(`type: ${type}, name: ${p.name}`));
    }
}

export function getPluginsOfType(player,type) {
    return player.__pluginData__?.pluginInstances[type];
}

export async function loadPluginsOfType(player,type) {
    player.__pluginData__.pluginInstances[type]?.forEach(async (plugin) => {
        const enabled = await plugin.isEnabled();
        if (enabled) {
            await plugin.load();
        }
    })
}

export default class Plugin extends PlayerResource {
    constructor(player,config,name) {
        super(player);
        this._name = name;
        this._config = config.plugins[this.name];
    }

    get config() { return this._config; }

    get type() { return "none"; }

    get order() { return 0; }
    
    get name() { return this._name; }

    async isEnabled() {
        return true;
    }

    async load() {

    }
}