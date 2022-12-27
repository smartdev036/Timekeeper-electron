import styles from './OffCanvasMenu.module.scss'

type propsType = {
  updateSideBarState: () => void, 
}

const OffCanvasMenu = (props: propsType) => {

  const onClickHandler = () => {
    props.updateSideBarState()
  }
  return <div className={styles.OffCanvasMenu}  onClick={onClickHandler}>
    &#9776;
  </div>
}

export default OffCanvasMenu;