import React, { useState, useEffect } from 'react'
import { useStore } from '../../store/useParadeStore'

export function Tutorial(){
  const [visible,setVisible] = useState(true)
  const step = useStore(s => s.tutorialStep)
  const joystick = useStore(s => s.joystickInput)
  const flip = useStore(s => s.flipControls)
  const coach = useStore(s => s.coachMode)

  useEffect(()=>{
    if(!visible) return
    // step 0: wait for joystick movement > 0.25
    if(step === 0 && Math.hypot(joystick.x, joystick.y) > 0.25){
      useStore.getState().setTutorialStep(1)
      return
    }
    // step 1: wait for flip toggle
    if(step === 1 && flip){
      useStore.getState().setTutorialStep(2)
      return
    }
    // step 2: wait for coach toggle
    if(step === 2 && coach){
      useStore.getState().setTutorialStep(3)
      return
    }
  }, [visible, step, joystick, flip, coach])

  if(!visible) return null

  const steps = [
    'Step 1: Move the thumbstick to begin (try dragging on the joystick).',
    'Step 2: Toggle "Flip X" in the HUD to invert left/right.',
    'Step 3: Enable "Coach Mode" to try slower, forgiving movement.',
    'Complete! You finished the quick tutorial.'
  ]

  return (
    <div data-testid="tutorial" style={{position:'absolute',left:12,top:12,background:'rgba(0,0,0,0.6)',padding:12,borderRadius:8,maxWidth:360}}>
      <div style={{fontWeight:700}}>Quick Tutorial</div>
      <div style={{fontSize:13,marginTop:8}}>{steps[step]}</div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
        <div style={{fontSize:12,color:'#9ca3af'}}>Progress: {Math.min(step,3)}/3</div>
        <div>
          {step >= 3 ? <button onClick={()=>{ useStore.getState().setTutorialStep(0); setVisible(false) }}>Finish</button> : <button onClick={()=>{ useStore.getState().setTutorialStep(Math.min(step+1,3)) }}>Skip</button> }
        </div>
      </div>
    </div>
  )
}

export default Tutorial
