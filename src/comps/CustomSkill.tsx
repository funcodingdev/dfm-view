import { useAppDispatch, useAppSelector } from '../feats/hooks'
import { selectEnemyDefRate, selectEnemyElRes, selectMyAttr, selectMyFinalEltype } from '../feats/selector/selectors'
import { selectClassAtype } from "../feats/selector/selfSelectors"
import { critFt, critChance, getDamage } from '../damage'
import { SetSkillFixValue, SetSkillInputName, SetSkillMaxHit, SetSkillUsesSkillInc, SetSkillValue } from '../feats/slices/customSkillSlice'
import { LabeledSwitch, LabeledNumberInput } from "./widgets/Forms"
import { AtypeAttrKey, Elemental } from '../constants'
import styled from 'styled-components'
import { Num } from './widgets/NumberView'


const SkillOneAttackHeader = styled.div`
  grid-column: 1 / 3;
  display: flex;
  flex-direction: row;

  input[type=text] {
    flex-grow: 2;
  }
`

const SkillOneAttackLayout = styled.div`
  
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: auto;
  justify-items: stretch;
  gap: 2px;

`

interface SkillInputOneProps extends CustomSkillOneAttackSpec {
  index: number
}

function SkillOneAttack({ index, value, fixed, isSkill = false, maxHit = 1, name }: SkillInputOneProps) {
  const dispatch = useAppDispatch()
  return (
    <SkillOneAttackLayout className="SkillOneAttack">
      <SkillOneAttackHeader>
        <input className="SkillName" type="text" value={name} onChange={ev => dispatch(SetSkillInputName([index, ev.target.value]))} />
        <LabeledSwitch className="SkillUsesInc" label="스킬" checked={isSkill} onChange={b => dispatch(SetSkillUsesSkillInc([index, b]))} />
      </SkillOneAttackHeader>
      <LabeledNumberInput label="계수(%)" value={value} onChange={v => dispatch(SetSkillValue([index, v]))} />
      <LabeledNumberInput label="고정값" value={fixed} onChange={v => dispatch(SetSkillFixValue([index, v]))} />
      <LabeledNumberInput label="타격 횟수" value={maxHit} onChange={v => dispatch(SetSkillMaxHit([index, v]))} />
    </SkillOneAttackLayout>
  )
}


interface SkillOutputOneProps {
  index: number
  SkillOneAttackSpec: CustomSkillOneAttackSpec
}
function CustomSkillAttackOne({ index, SkillOneAttackSpec }: SkillOutputOneProps) {

  const atype = useAppSelector(selectClassAtype)

  const attrs = useAppSelector(selectMyAttr)
  const atkFix = useAppSelector(state => state.My.Self.atkFixed)
  const eltype = useAppSelector(selectMyFinalEltype)
  const el = eltype.length > 0? (attrs[Elemental[eltype[0]].el] ?? 0) : 0
  const targetElRes = useAppSelector(selectEnemyElRes)

  const defRate = useAppSelector(selectEnemyDefRate)

  const dam = getDamage(atype, Math.max(el - targetElRes, 0), attrs, atkFix, SkillOneAttackSpec) * ( 1 - defRate )
  const damCrit = dam * critFt(attrs["cdmg_inc"], attrs["catk_inc"])
  const { Crit, CritCh } = AtypeAttrKey[atype]
  const chance = critChance(attrs[Crit], attrs[CritCh])
  const mean = chance * damCrit + (1 - chance) * dam

  
  return (
    <div className="SkillTestOne">
      <SkillOneAttack index={index} {...SkillOneAttackSpec} />
      <div className={"Result " + atype}>
        <div className="KeyName">데미지</div>
        <Num className="AttrValue" value={dam} separated />
      </div>
      <div className={"Result " + atype}>
        <div className="KeyName">평균 데미지</div>
        <Num className="AttrValue" value={mean} separated />
      </div>
      <div className={"Result " + atype}>
        <div className="KeyName">크리티컬 데미지</div>
        <Num className="AttrValue" value={damCrit} separated />
      </div>
    </div>
  )
}

const CustonSkillStyle = styled.div`
  
  display: flex;
  flex-direction: column;
  gap: 2px;

  .Result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    .AttrValue {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 999px) {
  .KeyName {
    font-size: 0.7rem;
  }
  .Result .AttrValue {
    font-size: 1rem;
  }
  
}
`

export function CustomSkillScreen() {
  const cases = useAppSelector(state => state.CustomSkill)
  
  return (
    <div>
      <header>
        <h3>스킬계수 직접 입력</h3>
      </header>
      <CustonSkillStyle>
      {cases.map((a, index) => (
        <CustomSkillAttackOne key={index} index={index} SkillOneAttackSpec={a} />
      ))}
      </CustonSkillStyle>
    </div>
    
  )
}
