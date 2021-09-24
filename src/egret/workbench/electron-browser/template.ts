export var DefaultBoxLayoutTemplate = {
	type: 'BoxLayoutContainer',
	isVertical: false,
	bounds: {
		x: 0,
		y: 0,
		width: 1386,
		height: 802
	},
	firstElement: {
		type: 'BoxLayoutContainer',
		isVertical: true,
		bounds: {
			x: 0,
			y: 0,
			width: 276,
			height: 802
		},
		firstElement: {
			type: 'BoxLayoutElement',
			bounds: {
				x: 0,
				y: 0,
				width: 276,
				height: 517.5
			},
			render: {
				selectedIndex: 0,
				panels: ['workbench.explorer']
			}
		},
		secondElement: {
			type: 'BoxLayoutElement',
			bounds: {
				x: 0,
				y: 518.5,
				width: 276,
				height: 283.5
			},
			render: {
				selectedIndex: 0,
				// panels: ['workbench.layer']
				panels: []
			}
		}
	},
	secondElement: {
		type: 'BoxLayoutContainer',
		isVertical: false,
		bounds: {
			x: 277,
			y: 0,
			width: 1109,
			height: 802
		},
		firstElement: {
			type: 'BoxLayoutContainer',
			isVertical: false,
			bounds: {
				x: 277,
				y: 0,
				width: 877.75,
				height: 802
			},
			firstElement: {
				type: 'BoxLayoutContainer',
				isVertical: true,
				bounds: {
					x: 277,
					y: 0,
					width: 646.5,
					height: 802
				},
				firstElement: {
					type: 'DocumentElement',
					bounds: {
						x: 277,
						y: 0,
						width: 646.5,
						height: 644.5
					},
					layoutInfo: {
						type: 'BoxLayoutElement',
						bounds: {
							x: 0,
							y: 0,
							width: 647,
							height: 645
						},
						render: {
							selectedIndex: 0,
							panels: []
						}
					}
				},
				secondElement: {
					type: 'BoxLayoutElement',
					bounds: {
						x: 277,
						y: 645.5,
						width: 646.5,
						height: 156.5
					},
					render: {
						selectedIndex: 0,
						// panels: ['workbench.output']
						panels: []
					}
				}
			},
			secondElement: {
				type: 'BoxLayoutContainer',
				isVertical: true,
				bounds: {
					x: 924.5,
					y: 0,
					width: 280,
					height: 802
				},
				firstElement: {
					type: 'BoxLayoutElement',
					bounds: {
						x: 924.5,
						y: 0,
						width: 280,
						height: 477.5
					},
					render: {
						selectedIndex: 0,
						// panels: ['workbench.assets']
						panels: []
					}
				},
				secondElement: {
					type: 'BoxLayoutElement',
					bounds: {
						x: 924.5,
						y: 478.5,
						width: 280,
						height: 323.5
					},
					render: {
						selectedIndex: 0,
						// panels: ['workbench.component']
						panels: []
					}
				}
			}
		},
		secondElement: {
			type: 'BoxLayoutContainer',
			isVertical: true,
			bounds: {
				x: 1155.75,
				y: 0,
				width: 280,
				height: 802
			},
			firstElement: {
				type: 'BoxLayoutElement',
				bounds: {
					x: 1155.75,
					y: 0,
					width: 280,
					height: 175
				},
				render: {
					selectedIndex: 0,
					// panels: ['workbench.align']
					panels: []
				}
			},
			secondElement: {
				type: 'BoxLayoutElement',
				bounds: {
					x: 1155.75,
					y: 176,
					width: 280,
					height: 626
				},
				render: {
					selectedIndex: 0,
					// panels: ['workbench.property']
					panels: []
				}
			}
		}
	}
};

export var DefaultResBoxLayoutTemplate = { 'type': 'DocumentElement', 'bounds': { 'x': 0, 'y': 0, 'width': 1487, 'height': 900 }, 'layoutInfo': { 'type': 'BoxLayoutElement', 'bounds': { 'x': 0, 'y': 0, 'width': 1487, 'height': 900 }, 'render': { 'selectedIndex': -1, 'panels': [] } } };