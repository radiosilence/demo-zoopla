'use strict';
/**
 * Basically the reasoning behind this is to create a system that dynamically
 * updates the accordion based on any data given to it (reactive), as opposed
 * to just outputting some DOM and modifying based on events.
 *
 * This is more akin to how the react library and one way binding frameworks
 * work, but obviously this is a vary rudimentary implementation.
 *
 * Obviously this could be far simpler, but in order to do CSS animation
 * combined with dynamic height of elements etc, I thought it prudent to emulate
 * the style I'm used to programming in (you hand it a bit of data and it)
 * handles updating the DOM accordingly, as opposed to just mangling the DOM
 * and hoping for the best).
 */
const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);
const e = document.createElement.bind(document);

const SECTIONS = [
  {
    id: '947367f8-4f73-445e-8376-c91f107e2210',
    title: 'Section 1',
    text: 'Bespoke tacos meditation unicorn fam hoodie. Cillum jianbing coloring book kinfolk. Venmo pork belly est art party man bun 90s, try-hard vinyl vegan nesciunt deep v veniam.Deep v nisi delectus, ex sint readymade esse consequat gochujang dolor.',
    el: null,
  },
  {
    id: '28427408-4903-40d9-809a-7221eabfbf1d',
    title: 'Section 2',
    text: 'Aliquip knausgaard labore, lomo green juice food truck magna bitters thundercats jianbing copper mug cold-pressed trust fund. Pickled portland meggings, schlitz nulla prism jianbing ethical. Kombucha mlkshk craft beer bespoke. Paleo incididunt fashion axe sustainable, cliche snackwave skateboard mixtape. Succulents air plant chicharrones, affogato synth esse before they sold out jianbing disrupt assumenda coloring book qui kitsch non.',
    el: null,
  },
];


/**
 * Returns a composite object that includes the section's node and ID.
 *
 * @param {Object} section
 * @param {Node} parent
 * @param {Boolean} open
 * @param {function} onOpen
 * @param {function} onRemove
 * @returns {Object}
 */
const SectionComponent = ({ section, parent, open, onOpen, onRemove}) => {
  const { id } = section;
  const node = e('section');
  const headerNode = e('header');
  const showButton = e('a');
  // We set this to blank so it still shows as a link
  showButton.href = '';
  showButton.addEventListener('click', (event) => {
    event.preventDefault();
    onOpen(id);
  });

  const removeButton = e('a');
  removeButton.href = '';
  removeButton.innerText = 'x';
  removeButton.addEventListener('click', (event) => {
    event.preventDefault();
    onRemove(id);
  });


  const h2Node = e('h2');
  headerNode.appendChild(showButton);
  headerNode.appendChild(removeButton);
  headerNode.appendChild(h2Node);
  node.appendChild(headerNode);

  const bodyNode = e('div');
  bodyNode.className = 'body';
  node.appendChild(bodyNode);


  /**
   * Get the height by cloning the element off canvas and measuring it.
   *
   * @returns Height
   */
  function getHeight() {
    const bodyClone = bodyNode.cloneNode(true);
    const width = parent.getBoundingClientRect().width;
    bodyClone.style.position = 'fixed';
    bodyClone.style.left = `${-width}px`;
    bodyClone.style.top = 0;

    bodyClone.style.width = `${width}px`;
    bodyClone.style.height = 'auto';
    document.body.appendChild(bodyClone);
    const height = bodyClone.getBoundingClientRect().height;
    document.body.removeChild(bodyClone);
    return height;
  }


  /**
   * Updates the nodes based on new data.
   *
   * @param {any} nextSection
   */
  const update = (nextSection) => {
    if (nextSection.title !== undefined) h2Node.innerText = nextSection.title;
    if (nextSection.text !== undefined) bodyNode.innerText = nextSection.text;

    showButton.innerText = nextSection.open ? '-' : '+';
    node.className = nextSection.open ? 'open' : '';
    bodyNode.style.height = nextSection.open ? '' + getHeight() + 'px' : 0;
  }

  update(Object.assign({}, section, { open: open }));

  return {
    id,
    node,
    update,
  };
}


/**
 * Initialises the accordion sections.
 *
 * @param {any} parent
 * @param {any} sectionData
 * @returns {Object}
 */
function initSections(parent, sectionData) {
  let _state = {};
  /**
   * Handles making sure the DOM reflects the data and state.
   */
  function setState(nextState) {
    _state = Object.assign({}, _state, nextState);
    const { data, openSection } = _state;
    // Update existing nodes
    data.forEach((section) => {
      const sectionComponent = sectionComponents[section.id];
      sectionComponent.update(Object.assign({}, section, {
        open: sectionComponent.id === openSection,
      }));
    });
    // Remove culled nodes
    const sectionIds = data.map(({ id }) => id);
    Object.keys(sectionComponents).forEach((id) => {
      if (sectionIds.indexOf(id) === -1) {
        parent.removeChild(sectionComponents[id].node);
        delete sectionComponents[id];
      }
    });
  };

  /**
   * Handler for section opening
   *
   * @param {any} id
   */
  function handleOpenSection(id) {
    setState({
      openSection: _state.openSection !== id ? id : null,
    });
  };


  /**
   * Handler for section removal
   *
   * @param {any} id
   */
  function handleRemoveSection(id) {
    setState({
      data: _state.data.filter(section => section.id !== id),
    });
  }

  // Reduce section components into a mapping between ID and the component,
  // for easy access.
  const sectionComponents = sectionData.reduce(
    (dst, section) => Object.assign({}, dst, {
      [section.id]: SectionComponent({
        section,
        parent,
        onOpen: handleOpenSection,
        onRemove: handleRemoveSection,
        open: section.id == _state.openSection,
      })
    }),
    {}
  );

  // Do our initial syncronization
  setState({
    openSection: sectionData[0].id,
    data: sectionData,
  });

  Object.keys(sectionComponents).forEach((id) => {
    parent.appendChild(sectionComponents[id].node);
  });

  return {
    update: (data) => {
      setState({ data });
    },
  };
}


/**
 * Initialise everythings.
 */
function main() {
  const { update } = initSections(qs('.accordion'), SECTIONS);
  window.updateData = update;
}

document.addEventListener('DOMContentLoaded', () => { main(); });
