import dynamic from 'next/dynamic'
import React from 'react'
import Split from 'react-split'
import { useSnapshot } from 'valtio'
import state from '../../state'
import { getSplit, saveSplit } from '../../state/actions/persistSplits'

const DeployEditor = dynamic(() => import('../../components/DeployEditor'), {
  ssr: false
})

const Accounts = dynamic(() => import('../../components/Accounts'), {
  ssr: false
})

const LogBox = dynamic(() => import('../../components/LogBox'), {
  ssr: false
})

const Deploy = () => {
  const { deployLogs } = useSnapshot(state)
  return (
    <Split
      direction="vertical"
      gutterSize={4}
      gutterAlign="center"
      sizes={getSplit('deployVertical') || [40, 60]}
      style={{ height: 'calc(100vh - 60px)' }}
      onDragEnd={e => saveSplit('deployVertical', e)}
    >
      <main style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <DeployEditor />
      </main>
      <Split
        direction="horizontal"
        sizes={getSplit('deployHorizontal') || [50, 50]}
        minSize={[320, 160]}
        gutterSize={4}
        gutterAlign="center"
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%'
        }}
        onDragEnd={e => saveSplit('deployHorizontal', e)}
      >
        <div style={{ alignItems: 'stretch', display: 'flex' }}>
          <Accounts />
        </div>
        <div>
          <LogBox title="Deploy Log" logs={deployLogs} clearLog={() => (state.deployLogs = [])} />
        </div>
      </Split>
    </Split>
  )
}

export default Deploy
