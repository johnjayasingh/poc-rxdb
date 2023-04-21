export const heroSchema = {
    title: 'hero schema',
    description: 'describes a simple hero',
    version: 1,
    primaryKey: 'name',
    type: 'object',
    properties: {
        name: {
            type: 'string',
            maxLength: 100,
        },
        color: {
            type: 'string'
        }
    },
    required: [
        'name',
        'color'
    ]
};


export const nodeSchema = {
    title: 'nodes schema',
    description: 'nodes',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100,
        },
        type: {
            type: 'string',
            maxLength: 100,
        },
        position: {
            type: 'object',
            properties: {
                x: {
                    type: 'number'
                },
                y: {
                    type: 'number'
                }
            },
            data: {
                type: 'object',
                properties: {
                    label: {
                        type: 'string',
                    }
                }
            },
            required: [
                'name',
                'color'
            ]
        }
    }
}


export const edgeSchema = {
    title: 'edges schema',
    description: 'edges',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100,
        },
        source: {
            type: 'string',
        },
        target: {
            type: 'string',
        },
    }
}

export const editorSchema = {
    title: 'editor schema',
    description: 'editor',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100,
        },
        data: {
            type: 'object',
        },
    }
}

export const profileSchema = {
    title: 'profile schema',
    description: 'profile',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100,
        },
        name: {
            type: 'string',
        },
        image: {
            type: 'string',
        },
        email: {
            type: 'string',
        },
    }
}