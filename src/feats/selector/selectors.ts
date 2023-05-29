import { createSelector } from '@reduxjs/toolkit'

import { applyAddMaxEldmg, atx, combine, dualTrigger, whatElType } from '../../attrs'
import { AtypeAttrKey } from '../../constants'
import { critChance, critFt, defRate, getElementalDamage, getPlainDamage, getRealdef } from '../../damage'
import { CombineItems } from '../../items'
import { add } from '../../utils'
import {
  selectAchBonus, selectCaliSource, selectClassAtype, selectDFChar, selectMyChoice, selectMyDFClass, selectLevel
} from './baseSelectors'
import { selectCreatureAndArtis } from './creatureSelectors'
import { selectCard2, selectEmblems2, selectEquips2, selectItem2, selectCracks } from './equipSelectors'
import { selectGuilds } from './guildSelectors'

import type { RootState } from "../store"
import { avatarParts, makeAvatarSet, rareSet, uncommonSet, getAvatarAttr } from '../../avatar'


/** 마력결정 스탯보너스를 모두 얻는다. */
export function selectTonics(state: RootState): AttrSource {
  const { el_all, hpmax, mpmax, strn_intl, vit_psi, def_ph, def_mg, Crit, Accu } = state.Tonic

  return {
    name: "마력결정",
    attrs: {
      strn: strn_intl,
      intl: strn_intl,
      vit: vit_psi,
      psi: vit_psi,
      Accu,
      ...atx("Crit", Crit),
      ...atx("El", el_all),
      def_ph,
      def_mg,
      hpmax,
      mpmax
    }
  }
}

/** 칭호를 장착 중일 때, 그 칭호 + 칭호에 박은 보주 + 엠블렘을 선택한다. */
export const selectDFTitleTown = createSelector(
  (state: V5State, charID: V5State["currentID"]) => selectItem2(state, charID, "칭호"),
  (state: V5State, charID: V5State["currentID"]) => selectCard2(state, charID, "칭호"),
  (state: V5State, charID: V5State["currentID"]) => selectEmblems2(state, charID, "칭호"),
  (dftitle, card, emblem): AttrSource[] => {
    if (!dftitle) return []
    return [dftitle, card, ...emblem]
  }
)


/** 지금 착용중인 레어 아바타의 수를 선택한다. */
export const selectRareAvatarCount = createSelector(
  selectDFChar,
  (dfchar) => avatarParts
    .map(part => dfchar.avatars[part])
    .reduce((n, rarity) => rarity === "Rare" ? n + 1 : n, 0)
)

/** 지금 착용중인 언커먼 아바타의 수를 선택한다. */
export const selectUncommonAvatarCount = createSelector(
  selectDFChar,
  (dfchar) => avatarParts
    .map(part => dfchar.avatars[part])
    .reduce((n, rarity) => rarity === "Uncommon" ? n + 1 : n, 0)
)


/** "아바타" 부분을 선택한다. */
export const selectWearAvatarSource = createSelector(
  selectDFChar,
  selectRareAvatarCount,
  selectUncommonAvatarCount,
  (dfchar, rareCount, uncommonCount) => {
    const rareSets = makeAvatarSet(rareSet, "레어아바타 세트")(rareCount)
    const uncommonSets = makeAvatarSet(uncommonSet, "상급아바타 세트")(uncommonCount)
    return [
      {
        name: "아바타 (모든부위 효과)",
        attrs: combine(...avatarParts.map(p => getAvatarAttr(p, dfchar.avatars[p])))
      },
      rareSets,
      uncommonSets
    ]
  }
)


/** 칭호+오라+무기아바타+다른 아바타 효과+아바타 세트효과를 모두 선택한다. */
export const selectAvatars = createSelector(
  selectDFTitleTown,
  selectWearAvatarSource,
  (state: V5State, charID: V5State["currentID"]) => selectItem2(state, charID, "오라"),
  (state: V5State, charID: V5State["currentID"]) => selectItem2(state, charID, "무기아바타"),
  (dftitle, wears, weaponAvatar, aura) => 
  [
    ...dftitle,
    aura,
    weaponAvatar,
    ...wears
  ]
)


/** 
 * 모든 "소스"를 선택한다.  
 * 
 * 직업 + 장비 + 아바타 + 크리쳐 + 마력결정 + 성안의봉인 + 길드 + 업적보너스 + 보정값  
 */
export const selectMySource = createSelector(
  selectMyDFClass,
  selectEquips2,
  selectAvatars,
  selectCreatureAndArtis,
  selectTonics,
  selectCracks,
  selectGuilds,
  selectAchBonus,
  selectCaliSource,
  (dfc, equips, avatars, creatures, tonic, cracks, guild, ach, cal) => {
    return [
      dfc,
      ...equips,
      ...avatars,
      ...creatures,
      tonic,
      ...cracks,
      guild,
      ach,
      cal
    ]
  }
)


/** 
 * 마을에서 내 스탯을 선택한다.  
 * **듀얼트리거/최대 속성강화 추가데미지가 포함되었다면 여기서 적용된다.**
*/
export const selectMyAttrTown = createSelector(
  selectMySource,
  (sources) => {
    const a = CombineItems(sources)
    return applyAddMaxEldmg(dualTrigger(a))
  }
)

/** 
 * 던전에서 내 스탯을 선택한다. (조건부옵션이 명시적으로 포함됨)  
 * **듀얼트리거/최대 속성강화 추가데미지가 포함되었다면 여기서 적용된다.**
*/
export const selectMyAttr = createSelector(
  selectMySource,
  selectMyChoice,
  (sources, choice) => {
    const a = CombineItems(sources, choice)
    return applyAddMaxEldmg(dualTrigger(a))
  }
)

/** 던전에서 내 크리티컬 확률을 선택한다. */
export const selectMyCritChance = createSelector(
  selectMyAttr,
  selectClassAtype,
  (attrs, atype) => {
    const { Crit, CritCh } = AtypeAttrKey[atype]
    return critChance(attrs[Crit], attrs[CritCh])
  }
)

/** 던전에서 내 원소 공격속성을 선택한다. */
export const selectMyFinalEltype = createSelector(
  selectMyAttr,
  whatElType
)

/** 던전에서 스증도, 크증도 적용되지 않은 내 퍼센트 물/마공 데미지를 선택한다. */
export const selectMyVanDamage = createSelector(
  selectMyAttr,
  selectClassAtype,
  selectMyFinalEltype,
  (attrs, atype, eltypes) => {
    return getPlainDamage(atype, eltypes, attrs)
  }
)

/** 던전에서 스증+크증이 모두 적용된 내 퍼센트 물/마공 데미지를 선택한다. */
export const selectMyDamage = createSelector(
  selectMyAttr,
  selectClassAtype,
  selectMyFinalEltype,
  (attrs, atype, eltypes) => {
    return +
    getPlainDamage(atype, eltypes, attrs)
    * critFt(attrs["cdmg_inc"], attrs["catk_inc"])
    * (1 + add(attrs["sk_inc"], attrs["sk_inc_sum"]) / 100)
  }
)

/** 캐릭터 선택창에서 보일 데미지를 선택한다. */
export const selectExpressionDamage = createSelector(
  selectClassAtype,
  selectMyDFClass,
  selectMyAttr,
  selectMyFinalEltype,
  (atype, dfcl, attrs, eltypes) => {
    const {
      Crit: critKey, CritCh: critChKey,
    } = AtypeAttrKey[atype]
    const chance = critChance(attrs[critKey], attrs[critChKey])
    let damage = (eltypes.length == 0 && (dfcl.name == "엘레멘탈마스터" || dfcl.name == "마도학자"))?
    getElementalDamage(attrs) : getPlainDamage(atype, eltypes, attrs)

    damage *= (1 + add(attrs["sk_inc"], attrs["sk_inc_sum"]) / 100)
    const cdamage = damage * critFt(attrs["cdmg_inc"], attrs["catk_inc"])

    return ((1 - chance) * damage) + (chance * cdamage)
  }
)


/** 내가 입력한 적 방어력을 선택한다. */
export function selectBaseEnemyDefense(state: RootState) {
  return state.EnemyTarget.Defense
}

/** 내가 입력한 적 속성저항을 선택한다. */
export function selectBaseEnemyElRes(state: RootState) {
  return state.EnemyTarget.ElRes
}

/** 방깎 적용후 적 방어력을 선택한다 */
export const selectEnemyDefense = createSelector(
  selectMyAttr,
  selectBaseEnemyDefense,
  (attrs = {}, def) => {
    const { target_def = 0, DefBreak = 0 } = attrs
    return getRealdef(def, target_def, DefBreak)
  }
)

/** 속깎 적용후 적 속성저항을 선택한다 */
export const selectEnemyElRes = createSelector(
  selectMyAttr,
  selectBaseEnemyElRes,
  (attrs, res) => {
    const { target_res = 0 } = attrs
    return Math.max(res + target_res, 0)
  }
)

/** 현재 상태의 내 레벨과 적 방어력(방깎적용)으로부터 방어율을 계산한다. */
export const selectEnemyDefRate = createSelector(
  selectLevel,
  selectEnemyDefense,
  defRate
)
