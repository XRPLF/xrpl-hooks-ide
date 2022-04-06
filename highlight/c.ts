/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { languages } from '../../fillers/monaco-editor-core';

export const conf: languages.LanguageConfiguration = {
	comments: {
		lineComment: '//',
		blockComment: ['/*', '*/']
	},
	brackets: [
		['{', '}'],
		['[', ']'],
		['(', ')']
	],
	autoClosingPairs: [
		{ open: '[', close: ']' },
		{ open: '{', close: '}' },
		{ open: '(', close: ')' },
		{ open: "'", close: "'", notIn: ['string', 'comment'] },
		{ open: '"', close: '"', notIn: ['string'] }
	],
	surroundingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" }
	],
	folding: {
		markers: {
			start: new RegExp('^\\s*#pragma\\s+region\\b'),
			end: new RegExp('^\\s*#pragma\\s+endregion\\b')
		}
	}
};

export const language = <languages.IMonarchLanguage>{
	defaultToken: '',
	tokenPostfix: '.c',

	brackets: [
		{ token: 'delimiter.curly', open: '{', close: '}' },
		{ token: 'delimiter.parenthesis', open: '(', close: ')' },
		{ token: 'delimiter.square', open: '[', close: ']' },
		{ token: 'delimiter.angle', open: '<', close: '>' }
	],

	keywords: [
		'abstract',
		'amp',
		'array',
		'asm',
		'auto',
		'break',
		'case',
		'char',
		'const',
		'continue',
		'default',
		'do',
		'double',
		'dynamic_cast',
		'else',
		'enum',
		'extern',
		'float',
		'for',
		'goto',
		'if',
		'inline',
		'int',
		'long',
		'register',
		'restrict',
		'return',
		'short',
		'signed',
		'sizeof',
		'static',
		'struct',
		'switch',
		'typedef',
		'union',
		'unsigned',
		'void',
		'volatile',
		'wchar_t',
		'where',
		'while',

		'__abstract', // reserved word with two underscores
		'__alignof',
		'__asm',
		'__assume',
		'__based',
		'__box',
		'__builtin_alignof',
		'__cdecl',
		'__clrcall',
		'__declspec',
		'__delegate',
		'__event',
		'__except',
		'__fastcall',
		'__finally',
		'__forceinline',
		'__gc',
		'__hook',
		'__identifier',
		'__if_exists',
		'__if_not_exists',
		'__inline',
		'__int128',
		'__int16',
		'__int32',
		'__int64',
		'__int8',
		'__interface',
		'__leave',
		'__m128',
		'__m128d',
		'__m128i',
		'__m256',
		'__m256d',
		'__m256i',
		'__m64',
		'__multiple_inheritance',
		'__newslot',
		'__nogc',
		'__noop',
		'__nounwind',
		'__novtordisp',
		'__pascal',
		'__pin',
		'__pragma',
		'__property',
		'__ptr32',
		'__ptr64',
		'__raise',
		'__restrict',
		'__resume',
		'__sealed',
		'__single_inheritance',
		'__stdcall',
		'__super',
		'__thiscall',
		'__try',
		'__try_cast',
		'__typeof',
		'__unaligned',
		'__unhook',
		'__uuidof',
		'__value',
		'__virtual_inheritance',
		'__w64',
		'__wchar_t'
	],

	operators: [
		'=',
		'>',
		'<',
		'!',
		'~',
		'?',
		':',
		'==',
		'<=',
		'>=',
		'!=',
		'&&',
		'||',
		'++',
		'--',
		'+',
		'-',
		'*',
		'/',
		'&',
		'|',
		'^',
		'%',
		'<<',
		'>>',
		'+=',
		'-=',
		'*=',
		'/=',
		'&=',
		'|=',
		'^=',
		'%=',
		'<<=',
		'>>='
	],

	// we include these common regular expressions
	symbols: /[=><!~?:&|+\-*\/\^%]+/,
	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	integersuffix: /([uU](ll|LL|l|L)|(ll|LL|l|L)?[uU]?)/,
	floatsuffix: /[fFlL]?/,
	encoding: /u|u8|U|L/,

	// The main tokenizer for our languages
	tokenizer: {
		root: [
			// C++ 11 Raw String
			[/@encoding?R\"(?:([^ ()\\\t]*))\(/, { token: 'string.raw.begin', next: '@raw.$1' }],

			// identifiers and keywords
			[
				/[a-zA-Z_]\w*/,
				{
					cases: {
						'@keywords': { token: 'keyword.$0' },
						'@default': 'identifier'
					}
				}
			],

			// The preprocessor checks must be before whitespace as they check /^\s*#/ which
			// otherwise fails to match later after other whitespace has been removed.

			// Inclusion
			[/^\s*#\s*include/, { token: 'keyword.directive.include', next: '@include' }],

			// Preprocessor directive
			[/^\s*#\s*\w+/, 'keyword.directive'],

			// whitespace
			{ include: '@whitespace' },

			// [[ attributes ]].
			[/\[\s*\[/, { token: 'annotation', next: '@annotation' }],
			// delimiters and operators
			[/[{}()\[\]]/, '@brackets'],
			[/[<>](?!@symbols)/, '@brackets'],
			[
				/@symbols/,
				{
					cases: {
						'@operators': 'delimiter',
						'@default': ''
					}
				}
			],

			// numbers
			[/\d*\d+[eE]([\-+]?\d+)?(@floatsuffix)/, 'number.float'],
			[/\d*\.\d+([eE][\-+]?\d+)?(@floatsuffix)/, 'number.float'],
			[/0[xX][0-9a-fA-F']*[0-9a-fA-F](@integersuffix)/, 'number.hex'],
			[/0[0-7']*[0-7](@integersuffix)/, 'number.octal'],
			[/0[bB][0-1']*[0-1](@integersuffix)/, 'number.binary'],
			[/\d[\d']*\d(@integersuffix)/, 'number'],
			[/\d(@integersuffix)/, 'number'],

			// delimiter: after number because of .\d floats
			[/[;,.]/, 'delimiter'],

			// strings
			[/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
			[/"/, 'string', '@string'],

			// characters
			[/'[^\\']'/, 'string'],
			[/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
			[/'/, 'string.invalid']
		],

		whitespace: [
			[/[ \t\r\n]+/, ''],
			[/\/\*\*(?!\/)/, 'comment.doc', '@doccomment'],
			[/\/\*/, 'comment', '@comment'],
			[/\/\/.*\\$/, 'comment', '@linecomment'],
			[/\/\/.*$/, 'comment']
		],

		comment: [
			[/[^\/*]+/, 'comment'],
			[/\*\//, 'comment', '@pop'],
			[/[\/*]/, 'comment']
		],

		//For use with continuous line comments
		linecomment: [
			[/.*[^\\]$/, 'comment', '@pop'],
			[/[^]+/, 'comment']
		],

		//Identical copy of comment above, except for the addition of .doc
		doccomment: [
			[/[^\/*]+/, 'comment.doc'],
			[/\*\//, 'comment.doc', '@pop'],
			[/[\/*]/, 'comment.doc']
		],

		string: [
			[/[^\\"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, 'string', '@pop']
		],

		raw: [
			[
				/(.*)(\))(?:([^ ()\\\t"]*))(\")/,
				{
					cases: {
						'$3==$S2': [
							'string.raw',
							'string.raw.end',
							'string.raw.end',
							{ token: 'string.raw.end', next: '@pop' }
						],
						'@default': ['string.raw', 'string.raw', 'string.raw', 'string.raw']
					}
				}
			],
			[/.*/, 'string.raw']
		],

		annotation: [
			{ include: '@whitespace' },
			[/[a-zA-Z0-9_]+/, 'annotation'],
			[/[,:]/, 'delimiter'],
			[/[()]/, '@brackets'],
			[/\]\s*\]/, { token: 'annotation', next: '@pop' }]
		],

		include: [
			[
				/(\s*)(<)([^<>]*)(>)/,
				[
					'',
					'keyword.directive.include.begin',


					'string.include.identifier',
					{ token: 'keyword.directive.include.end', next: '@pop' }
				]
			],
			[
				/(\s*)(")([^"]*)(")/,
				[
					'',
					'keyword.directive.include.begin',
					'string.include.identifier',
					{ token: 'keyword.directive.include.end', next: '@pop' }
				]
			]
		]
	}
};
