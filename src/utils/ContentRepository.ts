import axios from 'axios'

export function get_file_from_content_repository (homeserver: string, mxc_url: string) : Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    if (!mxc_url.startsWith('mxc://')) {
      reject(new Error('Not an mxc url!'))
    }
    const [, , server_name, file_id] = mxc_url.split('/')
    console.log('server_name:', server_name)
    console.log('file_id:', file_id)
    axios.get<Blob>(`${homeserver}/_matrix/media/r0/download/${server_name}/${file_id}`, {
      responseType: 'blob'
    })
      .then(response => {
        resolve(response.data)
      })
  })
}
