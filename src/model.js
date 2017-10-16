import index from './templates/content/index'
import styleMain from './templates/content/nu.scss'
import projectIndex from './templates/content/projects/index'
import projectDetail from './templates/content/projects/_slug/index'

import _ from 'lodash'
import slugify from 'slugify'
import moment from 'moment'

import MarkdownIt from 'markdown-it'
import MarkdownItHeaderSections from 'markdown-it-header-sections'
import MarkdownItHighlightJs from 'markdown-it-highlightjs'

let md = new MarkdownIt().use(MarkdownItHeaderSections).use(MarkdownItHighlightJs)

const slugger = _.partialRight(slugify, { lower: true })

function f(path, contentType, contentGenerator, locals) {
    if ((typeof contentGenerator) === 'string') {
        return Promise.resolve({
            Key: path,
            Body: contentGenerator,
            Bucket: process.env.S3_BUCKET,
            StorageClass: 'REDUCED_REDUNDANCY',
            ACL: 'public-read',
            ContentType: contentType
        })
    } else {
        return Promise.resolve(contentGenerator(locals)).then(content => {
            return {
                Key: path,
                Body: content,
                Bucket: process.env.S3_BUCKET,
                StorageClass: 'REDUCED_REDUNDANCY',
                ACL: 'public-read',
                ContentType: contentType
            }
        })
    }
}

async function g(path, contentGenerator, locals) {
    let gen = await contentGenerator 
    let loc = await locals 
    return Promise.resolve(contentGenerator(locals)).then(content => {
            return {
                Key: path,
                Body: content,
                Bucket: process.env.S3_BUCKET,
                StorageClass: 'REDUCED_REDUNDANCY',
                ACL: 'public-read',
                ContentType: 'text/html'
            }
        })
}

async function projectDoc (contentful, emitter, doc) {
    
}

async function projects (contentful, emitter) {
    
    let projects = await contentful.getEntries({content_type: 'project'})
    let cover = await contentful.getEntries({content_type: 'blockContent', 'fields.slug': 'projects'})
    
    g('projects/index.html', projectIndex, {projects, cover: cover.items[0], md}).then(emitter)
    for (let project of projects.items) {
        let docs = project.fields.docs ? await Promise.all(project.fields.docs.map(link => contentful.getEntry(link.sys.id))) : [];
        g(`projects/${project.fields.slug}/index.html`, projectDetail, {project, docs, md, slugger}).then(emitter)
    }
    
}

import blogIndex from './templates/content/scribble/index'
import blogPost from './templates/content/scribble/_blog/index'
import blogTagged from './templates/content/scribble/tags/_tag/index'

async function blog (contentful, emitter) {
    
    let posts = await contentful.getEntries({content_type: 'blogPost', order: '-fields.date'})
    
    let tags = _(posts.items).map(p => p.fields.tags).flatten().uniq().keyBy(slugger).invert().value();
    
    let summary = _.partialRight(_.truncate, { separator: '\n\n', length: 150 })
    
    g('scribble/index.html', blogIndex, {posts, _, summary, md}).then(emitter)
    for (let post of posts.items) {
        g(`scribble/${post.fields.slug}/index.html`, blogPost, {post, md, slugger, moment}).then(emitter)
    }
    
    _(posts.items).map(p => p.fields.tags).flatten().uniq().forEach(tag => {
        let slug = slugger(tag)
        let tagged_posts = _(posts.items).filter(p => p.fields.tags && _.includes(p.fields.tags, tag)).value() || []
        return g(`scribble/tags/${slug}/index.html`, blogTagged, {posts: tagged_posts, tag, slug, md}).then(emitter)
    })
    
}

import aboutIndex from './templates/content/me/index'
import aboutSkills from './templates/content/me/do/index'
import aboutExperience from './templates/content/me/done/index'
import aboutExperienceDetail from './templates/content/me/done/_exp/index'

async function about (contentful, emitter) {
    
    let cover = await contentful.getEntries({content_type: 'blockContent', 'fields.slug': 'me'})
    g('me/index.html', aboutIndex, {cover: cover.items[0], md}).then(emitter)
    
    let skills = await contentful.getEntries({content_type: 'cvSkill'})
    g('me/do/index.html', aboutSkills, {skills, md, slugger}).then(emitter)
    
    let experiences = await contentful.getEntries({content_type: 'cvExperience', order: '-fields.from'})
    let earliest = _.min(_.map(experiences.items, exp => moment(exp.fields.from).unix()))
    let latest = _.max(_.map(experiences.items, exp => moment(exp.fields.to).unix()))
    let relative = function (unixdate) { return 100* (moment(unixdate).unix() - earliest) / (latest - earliest) }
    g('me/done/index.html', aboutExperience, {experiences, relative, md, moment, slugger}).then(emitter)
    
    for (let experience of experiences.items) {
        let linked_skills = await contentful.getEntries({content_type: 'cvSkill', 'fields.developedAt.sys.id': experience.sys.id})
        g(`me/done/${slugger(experience.fields.title)}/index.html`, aboutExperienceDetail, {experience, linked_skills, md, moment, slugger}).then(emitter)
    }
    
}

export default async function (contentful, emitter) {
    
    f('index.html', 'text/html', index, {}).then(emitter)
    f('style.css', 'text/css', styleMain, {}).then(emitter)
    
    await projects(contentful, emitter)
    await blog(contentful, emitter)
    await about(contentful, emitter)
    
}