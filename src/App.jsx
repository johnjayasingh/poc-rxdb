import React, { Component, useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';

import 'reactflow/dist/style.css';
import { get } from './database/Database'
import { toast } from 'react-toastify';

class HeroList extends Component {
  state = {
    heroes: null,
    loading: true
  };
  subs = [];

  async componentDidMount() {
    const db = await get();

    const sub = db.heroes.find({
      selector: {},
      sort: [
        { name: 'asc' }
      ]
    }).$.subscribe(heroes => {
      if (!heroes) {
        return;
      }
      console.log('reload heroes-list ');
      this.setState({
        heroes,
        loading: false
      });
    });
    this.subs.push(sub);
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  deleteHero = async (hero) => {
    console.log('delete hero:');
    console.dir(hero);
    await hero.remove();
  }

  editHero = async (hero) => {
    console.log('edit hero:');
    console.dir(hero);
  }

  render() {
    const { heroes, loading } = this.state;
    return (
      <div id="list-box" className="box" >
        <h3>Colors</h3>
        {loading && <span>Loading...</span>}
        {!loading && heroes.length === 0 && <span>No heroes</span>}
        {!loading &&
          <ul id="heroes-list" style={{
            listStyle: 'none',
            padding: 0
          }}>
            {heroes.map(hero => {
              return (
                <li key={hero.name} style={{
                  flexDirection: 'row',
                  margin: 10,
                  display: 'flex'
                }}>
                  <div className="color-box" style={{
                    background: hero.color,
                    height: 20,
                    marginLeft: 10,
                    marginRight: 10,
                    width: 20,
                    borderRadius: 10
                  }}></div>
                  <span className="name">
                    {hero.name}
                  </span>
                  <div className="actions">
                    <button style={{
                      marginLeft: 10,
                    }} className="delete fa fa-trash-o" aria-hidden="true" onClick={() => this.deleteHero(hero)}>DELETE</button>
                  </div>
                </li>
              );
            })}
          </ul>
        }
      </div>
    );
  }
}

class HeroInsert extends Component {
  state = {
    name: '',
    color: ''
  }
  subs = []

  addHero = async (event) => {
    event.preventDefault();
    const { name, color } = this.state;
    const db = await get();

    const addData = {
      name,
      color
    };
    await db.heroes.insert(addData);
    this.setState({
      name: '',
      // color: ''
    });
  }
  handleNameChange = (event) => {
    this.setState({ name: event.target.value });
  }
  handleColorChange = (event) => {
    this.setState({ color: event.target.value });
  }

  render() {
    return (
      <div id="insert-box" className="box">
        <h3>Add Hero</h3>
        <form onSubmit={this.addHero}>
          <input name="name" type="text" placeholder="Name" value={this.state.name} onChange={this.handleNameChange} />
          <input name="color" type="color" placeholder="Color" value={this.state.color} onChange={this.handleColorChange} />
          <button type="submit">Insert a Hero</button>
        </form>
      </div>
    );
  }
}

function WebView() {
  const [error, setError] = useState('')
  console.log(error)
  return <div style={{
    padding: 30,
    backgroundColor: '#CCC'
  }}>
    WebView
  </div>
}

const nodeTypes = {
  webview: WebView,
};

// const initialNodes = [
//   { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
//   { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
// ];
// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

function Canvas() {

  const [enableSave, setEnableSave] = useState(false);
  const [label, setLabel] = useState('')
  const [rfInstance, setRfInstance] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  useEffect(() => {
    let sub;
    let sub2;
    const init = async () => {
      const db = await get();

      sub = db.nodes.find({
        selector: {},
        sort: [
          { name: 'asc' }
        ]
      }).$.subscribe(nodes => {
        if (!nodes) {
          return;
        }
        console.log('reload nodes-list ');
        setNodes(JSON.parse(JSON.stringify(nodes?.filter((val) => val.position))));
      });
      sub2 = db.edges.find({
        selector: {},
        sort: [
          { name: 'asc' }
        ]
      }).$.subscribe(edges => {
        if (!edges) {
          return;
        }
        console.log('reload edges-list ');
        setEdges(JSON.parse(JSON.stringify(edges)));
      });
    }
    init()
    return sub?.unsubscribe()
  }, [])

  const onSave = useCallback(async () => {
    if (rfInstance) {
      const db = await get();
      const flow = rfInstance.toObject();
      for (const edge of flow.edges) {
        await db.edges.upsert(edge);
      }
      for (const node of flow.nodes) {
        await db.nodes.upsert(node);
      }
      toast.success('Sync Success')
    }
  }, [rfInstance]);

  const addNode = async (event, type = 'line') => {
    event.preventDefault();
    const db = await get();

    const addData = { id: label, position: { x: Math.random() * 500, y: Math.random() * 500 }, type, data: { label } };
    console.log(addData)
    await db.nodes.insert(addData);
    if (nodes.length > 0) {
      const previous = nodes[nodes.length - 1];
      const addEdgeData = { id: `${previous.data?.label || nodes.length - 1}-${addData.data.label}`, source: previous.id, target: addData.id }
      await db.edges.insert(addEdgeData);
    }
  }


  const handleNodeChange = async (changes) => {
    onNodesChange(changes)
    setEnableSave(true);
    // Live Sync
    for (const change of changes) {
      if (change.type === 'position') {
        if (!change.dragging) {
          const flow = rfInstance.toObject();
          const updated = flow?.nodes?.find(data => data?.id === change?.id);
          console.log('Commit changes', change, updated)
          const db = await get();
          await db.nodes.incrementalUpsert(updated).catch(console.error);
        }
      }
    }
  }

  return (
    <>
      <button onClick={onSave} type="submit">Save Changes</button>
      <form onSubmit={addNode}>
        <input name="name" type="text" placeholder="Node Label" value={label} onChange={(e) => {
          setLabel(e.target.value)
        }} />
        <button disabled={!label} type="submit">Insert a Node</button>
      </form>
      <form onSubmit={(event) => {
        addNode(event, 'webview')
      }}>
        <input name="url" type="text" placeholder="Website URL" value={label} onChange={(e) => {
          setLabel(e.target.value)
        }} />
        <button disabled={!label} type="submit">Insert a Website</button>
      </form>
      <div style={{ width: '100vw', height: '80vh', background: 'black' }}>
        <ReactFlow
          onInit={setRfInstance}
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodeChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </>
  );
}

const EDITTOR_HOLDER_ID = 'editorjs';


const DEFAULT_INITIAL_DATA = () => {
  return {
    "time": new Date().getTime(),
    "blocks": [
      {
        "type": "header",
        "data": {
          "text": "This is my awesome editor!",
          "level": 1
        }
      },
    ]
  }
}

function EditorComponent() {
  const ejInstance = useRef();
  const [editorData, setEditorData] = React.useState(DEFAULT_INITIAL_DATA);

  // This will run only once
  useEffect(() => {
    if (!ejInstance.current) {
      initEditor();
    }
    return () => {
      ejInstance.current?.destroy();
      ejInstance.current = null;
    }
  }, []);

  const initEditor = () => {
    const editor = new EditorJS({
      holder: EDITTOR_HOLDER_ID,
      logLevel: "ERROR",
      data: editorData,
      onReady: () => {
        ejInstance.current = editor;
      },
      onChange: async () => {
        let content = await this.editorjs.saver.save();
        // Put your logic here to save this data to your DB
        setEditorData(content);
      },
      autofocus: true,
      tools: {
        header: Header,
      },
    });
  };
  return <div id={EDITTOR_HOLDER_ID}> </div>

}

function Editor() {

  const [label, setLabel] = useState('')


  const addEditor = async (event) => {
    event.preventDefault();
    const db = await get();

    const addData = { id: label, data };
    console.log(addData)
    await db.nodes.insert(addData);
    if (nodes.length > 0) {
      const previous = nodes[nodes.length - 1];
      const addEdgeData = { id: `${previous.data?.label || nodes.length - 1}-${addData.data.label}`, source: previous.id, target: addData.id }
      await db.edges.insert(addEdgeData);
    }
  }
  return <div style={{ width: '100vw', height: '80vh', marginTop: 20 }}>
    <form onSubmit={addEditor}>
      <input name="name" type="text" placeholder="Heading" value={label} onChange={(e) => {
        setLabel(e.target.value)
      }} />
      <button disabled={!label} type="submit">Add Editor</button>
    </form>
    <EditorComponent />
  </div>
}


function App() {
  return (
    <>
      <HeroList />
      <HeroInsert />
      <Canvas />
      <Editor />
    </>
  );
};

export default App;
