import { useState, useRef, useEffect } from 'react'
import ReactQuill from 'react-quill';
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'
import Quill from 'quill'
import QuillCursors, { Cursor } from 'quill-cursors'
import 'react-quill/dist/quill.bubble.css';
import './App.css'


Quill.register('modules/cursors', QuillCursors)

const SELECTION_CLASS = 'ql-cursor-selections' as const;
const CARET_CLASS = 'ql-cursor-caret' as const;
const CARET_CONTAINER_CLASS = 'ql-cursor-caret-container' as const;
const FLAG_CLASS = 'ql-cursor-flag' as const;
const NAME_CLASS = 'ql-cursor-name' as const;

const images = [
  'https://www.placecage.com/gif/110/110',
  'https://www.placecage.com/200/200',
  'https://www.placecage.com/78/78',
  'https://www.placecage.com/80/80',
];

const colors = [
  '#81B814',
  '#05A8FA',
  '#FFBB00',
  '#DF2060',
];

function App() {
  const r = Math.floor(Math.random() * 3);

  const YdocRef = useRef<Y.Doc | null>(null);
  const YWebSocketProviderRef = useRef<WebsocketProvider | null>(null)
  const QuillBindingRef = useRef<QuillBinding | null>(null);
  const [nickname, updateNickname] = useState('');
  const [ready, setReady] = useState(false);
  const quillRef = useRef<ReactQuill | null>(null);

  useEffect(() => {
    if (quillRef.current) {
      YdocRef.current = new Y.Doc();
      YWebSocketProviderRef.current = new WebsocketProvider('ws://localhost:1234', 'trying-1', YdocRef.current);

      const ytext = YdocRef.current.getText('quill');
      QuillBindingRef.current = new QuillBinding(ytext, quillRef.current.getEditor(), YWebSocketProviderRef.current.awareness)

      return () => {
        YdocRef.current?.destroy();
        YWebSocketProviderRef.current?.destroy();
        QuillBindingRef.current?.destroy();
      }
    }
  }, [ready]);

  useEffect(() => {
    if (ready) {
      YWebSocketProviderRef.current?.awareness.setLocalStateField('user', {
        name: nickname,
        color: colors[r],
      });
    }
  }, [ready, nickname]);

  const template = `
  <span class="${ SELECTION_CLASS }"></span>
  <span class="${ CARET_CONTAINER_CLASS }">
    <span class="${ CARET_CLASS }"></span>
  </span>
  <div class="${ FLAG_CLASS }">
    <img src="${images[r]}" width="24" height="24" />
    <small class="${ NAME_CLASS }"></small>
  </div>
`;

  return (
    <div className="App">
      <h1>Realtime Edit</h1>

      { !ready && (
        <form className="Form">
          <input type="text" placeholder="nickname?" value={nickname} onChange={(e) => {updateNickname(e.target.value.trim())}} />
          <button type="button" onClick={() => { setReady(true); }} disabled={nickname.length === 0}>go</button>
        </form>
      )}

      { ready && (
        <ReactQuill
          ref={quillRef}
          theme="bubble"
          modules={{
            cursors: {
              template,
              hideDelayMs: 5000000,
              transformOnTextChange: true,
            },
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link']
            ],
            history: {
              userOnly: true
            }
          }}
          placeholder="Start collaborating..."
          onChange={(value) => {
            console.log(value);
          }}
        />
      )}
    </div>
  )
}

export default App
