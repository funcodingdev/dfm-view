import { perfectGuild } from "../../constants"


export const initCustomSkill: CustomSkillOneAttackSpec[] = [
  {
    name: "평타",
    value: 300,
    fixed: 100,
    hit: 3
  },
  {
    name: "평타 막타",
    value: 500,
    fixed: 125,
  },
  {
    name: "스킬1",
    value: 2256,
    fixed: 2256,
    isSkill: true
  },
  {
    name: "스킬 2",
    value: 1210,
    fixed: 1210,
    hit: 5,
    isSkill: true
  },
  {
    name: "스킬3",
    value: 250,
    fixed: 250,
    hit: 15,
    isSkill: true
  },
  {
    name: "각성기(연타형)",
    value: 400,
    fixed: 400,
    hit: 70,
    isSkill: true
  },
  {
    name: "각성기(한방형)",
    value: 21000,
    fixed: 21000,
    isSkill: true
  },
]


export const initCharState: DFCharState = {
  id: "InitID",
  TimeStamp: Date.now(),
  "name": "캐릭터 이름",
  "dfclass": "레인저(남)",
  "level": 65,
  "achieveLevel": 9,
  "atkFixed": 317,
  "Item": {
    "무기": "키리의 미완성 넨건",
    "상의": "암살자의 서슬 자켓",
    "하의": "암살자의 서슬 팬츠",
    "머리어깨": "암살자의 서슬 스트랩",
    "벨트": "암살자의 서슬 벨트",
    "신발": "암살자의 서슬 부츠",
    "팔찌": "영념의 정화수",
    "목걸이": "생명의 이슬",
    "반지": "유랑하는 바람",
    "보조장비": "브왕가의 족장 완장",
    "칭호": "월하/뜨거운 썸머 바캉스",
    "오라": "월하/바캉스/메이플 오라",
    "무기아바타": "이달의 아이템 무기아바타",
    "봉인석": "섬멸자의 봉인석 (힘+물리공격력)",
    "정수": [
      "섬멸자의 정수 (힘+물리공격력)",
      "섬멸자의 정수 (힘+물리공격력)",
      "섬멸자의 정수 (힘+물리공격력)",
      "섬멸자의 정수 (힘+물리공격력)",
      "섬멸자의 정수 (힘+물리공격력)"
    ],
    "크리쳐": "진: 정령왕",
    "아티팩트": {
      "Red": "레어 아티팩트-레드",
      "Green": "레어 아티팩트-그린",
      "Blue": "레어 아티팩트-블루"
    }
  },
  "Card": {
    "무기": "스페셜 데미지 보주",
    "상의": "적진주 켈라이노 카드",
    "하의": "적진주 켈라이노 카드",
    "머리어깨": "기어의 디샤 카드",
    "벨트": "피리토 - 곰 카드",
    "신발": "허의 환혼 카드",
    "팔찌": "타르타로스 카드",
    "목걸이": "타르타로스 카드",
    "반지": "타르타로스 카드",
    "보조장비": "불의 사념체 카드",
    "칭호": null
  },
  "Emblem": {
    "무기": [["Red", 7], ["Red", 7]],
    "상의": [["Red", 7], ["Red", 7]],
    "하의": [["Red", 7], ["Red", 7]],
    "머리어깨": [["Yellow", 7], ["Yellow", 7]],
    "벨트": [["Yellow", 7], ["Yellow", 7]],
    "신발": [["Blue", 7], ["Blue", 7]],
    "팔찌": [["Blue", 7], ["Blue", 7]],
    "목걸이": [["Green", 7], ["Green", 7]],
    "반지": [["Green", 7], ["Green", 7]],
    "보조장비": [["Stren", 5]],
    "칭호": [["Stren", 5]]
  },
  "MagicProps": {
    "무기": ["dmg_inc", "Stat", "Stat"],
    "상의": ["Stat", "Stat", "Stat"],
    "하의": ["Stat", "Stat", "Stat"],
    "머리어깨": ["Stat", "Stat", "Stat"],
    "벨트": ["Stat", "Stat", "Stat"],
    "신발": ["Stat", "Stat", "Stat"],
    "팔찌": ["el_lght", "el_lght", "el_lght"],
    "목걸이": ["el_lght", "el_lght", "el_lght"],
    "반지": ["el_lght", "el_lght", "el_lght"],
    "보조장비": ["Crit", "Crit", "Crit"],
    "봉인석": ["Accu", "Accu", "Accu"]
  },
  "Upgrade": {
    "무기": 549,
    "상의": 31,
    "하의": 31,
    "머리어깨": 31,
    "벨트": 31,
    "신발": 31,
    "팔찌": 41,
    "목걸이": 41,
    "반지": 41,
    "보조장비": 46
  },
  "Material": {
    "상의": "가죽",
    "하의": "가죽",
    "머리어깨": "가죽",
    "벨트": "가죽",
    "신발": "가죽"
  },
  "Avatar": {
    "모자": "Uncommon",
    "얼굴": "Uncommon",
    "상의": "Uncommon",
    "목가슴": "Uncommon",
    "신발": "Uncommon",
    "머리": "Uncommon",
    "하의": "Uncommon",
    "허리": "Uncommon"
  },
  "Guild": {
    ...perfectGuild,
    "PublicStatLv": 5
  },
  "CreatureValue": {
    "Creature": 156,
    "Red": 50,
    "Blue": 50,
    "Green": 10,
  },
  "Choice": {
    "branches": {},
    "gives": {},
    "exclusives": {}
  },
  "Calibrate": {
    eltype: [],
    sk_inc: [0],
  },
  SkillLevelMap: {},
  SkillTPMap: {},
  SkillUsageCountMap: {},
  SkillChargeupMap: {},
}

