import styled from "styled-components"
import Fuse from "fuse.js"
import { MouseEventHandler, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../feats/hooks"
import { equipParts, getCircus2Items, getItem, getItemsByPart, isAccess, isArmor, isWeapon, party } from "../../items"
import { ItemIcon } from "../widgets/Icons"
import { ModalContext } from "./modalContext"

import _left from "../../../data/sets/left.json"
import _right from "../../../data/sets/right.json"
import { FetchItems, SetItem } from "../../feats/slices/itemSlice"
import { selectMyDFClass } from "../../feats/selector/selfSelectors"
import { ModalItemSelect } from "./Select"
import { CurrentPart } from "./CurrentPart"
import { TabContext } from "../../responsiveContext"
import { NavLink, Tab } from "../widgets/Tab"
import { ItemDetail } from "../widgets/ItemView"
import { mainItemSelector } from "./CurrentPart"
import produce from "immer"

type EquipShotgun = Partial<Pick<ItemsState, EquipPart>>

const fuseOption = { keys:["name"], threshold: 0.3 }

const left = _left as Record<string, EquipShotgun>
const right = _right as Record<string, EquipShotgun>

const SearchField = styled.input`
input[type=text]& {
  width: calc(100% - 40px);
  height: 1.2rem;
  margin-block: 0.5rem;
  text-align: center;

  position: sticky;
  top: 0.5rem;
  z-index: 1;
  background-color: #000000;
}
`

const ItemSizeDefiner = styled.div`
  --item-size: 50px;
`

interface IsetCatalog {
  name: string
  items: DFItem[]
  useThisForPayload: EquipShotgun
}

const EquipShotgunStyle = styled.div`
  padding: 4px;

  .IsetName {
    margin-block: 0.1rem;
    font-weight: 700;
  }

  .IsetIconArray {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
`

function EquipShotgunTab({ item, onClick }: { item: IsetCatalog, onClick: MouseEventHandler<HTMLDivElement>}) {
  const { closeModal } = useContext(ModalContext)
  const { name, items, useThisForPayload } = item
  const dispatch = useAppDispatch()
  return (
    <EquipShotgunStyle className="EquipShotgun" onClick={() => { dispatch(FetchItems(useThisForPayload)); closeModal() }}>
      <div className="IsetName">{name}</div>
      <div className="IsetIconArray">
      {items.map((item) => (
        <ItemIcon key={item.name} item={item} />
        ))}
      </div>
    </EquipShotgunStyle>
  )
}

function myItemSorter(myWeapons: WeaponType[], a: DFItem, b: DFItem) {
  return myWeapons.indexOf(a.itype as WeaponType) - myWeapons.indexOf(b.itype as WeaponType)
}

function pickItems(items: DFItem[], part: WholePart, myWeapons?: WeaponType[]) {
  if (part == "무기" && myWeapons)
  return items
  .filter(item => myWeapons.includes(item.itype as WeaponType))
  .sort(myItemSorter.bind(null, myWeapons))

  return items.filter(item => !(item.content?.includes("환영극단 2막")))
}

function inflate(m: Record<string, string>) {
  return Object.keys(m).map(part => getItem(m[part]))
}

function loadShotgun(part: WholePart) {
  let v: Record<string, EquipShotgun>
  if (isArmor(part)) v = left
  else if (isAccess(part)) v = right
  else return

  const w: IsetCatalog[] = []
  for (const isetname of Object.keys(v).sort()) {
    w.push({
      name: isetname,
      items: inflate(v[isetname]),
      useThisForPayload: v[isetname]
    })
  }

  return w
}

interface SearchListProps<IT extends DFItem | IsetCatalog> {
  query: string
  collection: IT[]
  onItemClick: (item: IT) => unknown
  ChildComponent: React.FC<{ item: IT, onClick: MouseEventHandler<HTMLDivElement> }>
}

function SearchList<IT extends DFItem | IsetCatalog>({ collection, query, onItemClick, ChildComponent }: SearchListProps<IT>) {

  const fuse: Fuse<IT> = useMemo(() => new Fuse<IT>(collection, fuseOption), [])
  const [result, setResult] = useState<IT[]>(query? fuse.search(query).map(s => s.item) : collection)

  useEffect(() => {
    fuse.setCollection(collection)
  }, [collection])

  useEffect(() => {
    setResult(query? fuse.search(query).map(s => s.item) : collection)
  }, [collection, query])

  return <>
    {result.map(item => 
      <ChildComponent key={item.name} item={item} onClick={() => onItemClick(item)} />
    )}
  </>
}

function SingleItemList({ part }: { part: WholePart }) {
  const { closeModal } = useContext(ModalContext)
  const [query, setQuery] = useState("")
  const dispatch = useAppDispatch()
  const myDFclass = useAppSelector(selectMyDFClass)

  const onClick = useCallback((item: DFItem) => {
    dispatch(SetItem([part as EquipPart | "칭호" | "오라" | "무기아바타", item.name]))
    closeModal()
  }, [part])

  const myWeapons = myDFclass.weapons ?? []
  const dependencies = [part, myDFclass.name]
  const items = useMemo(() => pickItems(getItemsByPart(part), part, myWeapons), dependencies)
  return (
  <div>
    <SearchField type="text" placeholder="아이템 이름 찾기" value={query} onChange={ev => setQuery(ev.target.value)} />
    <div className="ItemSelectArray">
      <SearchList collection={items} query={query} onItemClick={onClick} ChildComponent={ModalItemSelect} />
    </div>
  </div>
  )
}

function Circus2OneSet({ isetname, items }: { isetname: string, items: DFItem[] }) {
  return (
    <>
      <h4>{isetname.split(/\s+/)[1]}</h4>
      {items.map(item => <ItemIcon key={item.name} item={item} onClick={() => {}} />)}
    </>
  )
}

const Circus2ListStyle = styled.div`
  button.Apply {
    position: sticky;
    bottom: 0;
  }
`

const Circus2ListInnerLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(11, auto);

  .ItemIcon {
    opacity: 0.75;
    filter: grayscale(50%);

    &.Active {
      opacity: 1;
      filter: unset;
    }
  }

  @media screen and (max-width: 999px) {
    grid-template-rows: repeat(11, auto);
    grid-template-columns: unset;
    grid-auto-flow: column;
  }
`

function Circus2List() {
  const myDFClass = useAppSelector(selectMyDFClass)
  const collection = getCircus2Items(myDFClass.name)
  const currentItems = equipParts.map(part => useAppSelector(state => state.My.Item[part])).map(name => getItem(name))
  const [shotgun, setShotgun] = useState<EquipShotgun>(currentItems.reduce((sh, item) => 
    (sh[party(item.itype)] = item.name, sh)
  , {}))
  const onItemClick = useCallback((item: DFItem) => {
    const part: EquipPart = party(item.itype) as EquipPart
    setShotgun(produce(shotgun, sh => { sh[part] = item.name }))
  }, [])
  return (
    <Circus2ListStyle>
      <div style={{ marginBlock: "1rem" }}>
        착용할 아이템을 선택한 후, 아래의 "착용하기" 버튼을 눌러주세요.<br />
        세트 이름을 누르면 모든 세트 아이템을 장착합니다.<br />
      </div>
      <Circus2ListInnerLayout>
        <h4>(착용중)</h4>
        {currentItems.map((item, index) =>
          <ItemIcon key={item.name} item={item} className={shotgun[party(item.itype)] == item.name ? "Active" : ""} onClick={() => onItemClick(item)} />
        )}
        {Object.keys(collection).map(isetName => 
          <Circus2OneSet key={isetName} isetname={isetName} items={collection[isetName]}/>
        )}
      </Circus2ListInnerLayout>
      <button className="Apply">착용하기</button>
    </Circus2ListStyle>
    
  )
}

function Epic60SetList({ part }: { part: WholePart }) {
  const isets = loadShotgun(part) ?? []
  const [query, setQuery] = useState("")
  return (
    <div>
      <SearchField type="text" placeholder="세트 이름 찾기" value={query} onChange={ev => setQuery(ev.target.value)} />
      <div className="ItemShotgunArray">
        <SearchList collection={isets} query={query} onItemClick={() => {}} ChildComponent={EquipShotgunTab} />
      </div>
    </div>
  )
}



const SelectType = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`



export function ItemSelect({ part }: { part: WholePart }) {
  const mainitem = useAppSelector(mainItemSelector(part))
  const [activeTab, setActiveTab] = useState("일반")

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <CurrentPart part={part} />
      <ItemSizeDefiner>
        <SelectType>
          <NavLink name="효과">효과 보기</NavLink>
          <NavLink name="일반">일반</NavLink>
          <NavLink name="환영극단 2막">환영극단 2막</NavLink>
          <NavLink name="세트">세트</NavLink>
        </SelectType>
        <div className="ModalMenuScrollable">
          <Tab name="효과">
            <ItemDetail item={mainitem} />
          </Tab>
          <Tab name="일반">
            <SingleItemList part={part} />
          </Tab>
          <Tab name="환영극단 2막">
            <Circus2List />
          </Tab>
          <Tab name="세트">
            <Epic60SetList part={part} />
          </Tab>
        </div>
      </ItemSizeDefiner>
    </TabContext.Provider>
  )
}




